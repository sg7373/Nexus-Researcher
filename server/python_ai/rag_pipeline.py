import os
import re
from collections import defaultdict

from dotenv import load_dotenv
from langchain_community.document_loaders import PyMuPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv()

api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise RuntimeError("GROQ_API_KEY is required for python_ai service")

llm = ChatGroq(model="llama-3.1-8b-instant", api_key=api_key)

vectorstore = None
retriever = None


def clean_text(text):
    text = re.sub(r"\n+", " ", text)
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"[^a-zA-Z0-9.,;:()\- ]", "", text)
    return text


text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")


def build_vectorstore(upload_folder):
    global vectorstore
    global retriever

    docs = []

    for file_name in os.listdir(upload_folder):
        if not file_name.lower().endswith(".pdf"):
            continue

        file_path = os.path.join(upload_folder, file_name)
        loader = PyMuPDFLoader(file_path)
        documents = loader.load()

        for doc in documents:
            doc.metadata["source"] = file_name
            doc.metadata["page"] = doc.metadata.get("page")

        docs.extend(documents)

    if not docs:
        print("No documents found.")
        return

    for doc in docs:
        doc.page_content = clean_text(doc.page_content)

    documents = text_splitter.split_documents(docs)
    if len(documents) == 0:
        print("No document chunks found. Vectorstore not built.")
        return

    vectorstore = FAISS.from_documents(documents, embeddings)
    retriever = vectorstore.as_retriever(search_type="mmr", search_kwargs={"k": 8})

    print(f"Vectorstore built with {len(documents)} chunks")


def retrieve_diverse(query, k_per_paper=2, k_total=10):
    if retriever is None:
        return []

    results = retriever.invoke(query)
    by_source = defaultdict(list)

    for doc in results:
        by_source[doc.metadata["source"]].append(doc)

    diverse = []
    for _, items in by_source.items():
        diverse.extend(items[:k_per_paper])

    return diverse[:k_total]


def ask_question(query):
    if retriever is None:
        return "No documents uploaded yet. Upload at least one PDF first."

    docs = retrieve_diverse(query)

    context = "\n".join(
        [
            f"Paper: {doc.metadata['source']} | Page: {doc.metadata.get('page')}\n{doc.page_content[:500]}"
            for doc in docs
        ]
    )

    prompt = f"""
You are an AI research assistant helping analyze academic papers.

Use ONLY the provided context.
If information is incomplete, infer cautiously from the text.
If multiple papers are provided, compare strictly based on labeled sources.
If they belong to unrelated fields, explicitly state they are unrelated.

When summarizing, use this structure:
- Problem
- Method
- Contributions
- Results/Impact

If asked for contributions, return concise bullet points.
If asked for limitations or research gaps, provide:
1. Limitations
2. Research gaps
3. Future work

If asked for new ideas, provide 3 ideas and include:
- idea
- motivation
- possible experiment

Now answer the real question.

Context:
{context}

Question:
{query}

Answer clearly:
"""

    response = llm.invoke(prompt)
    pages = [doc.metadata.get("page", "unknown") for doc in docs]
    return response.content + f"\n\nSources: {pages}"
