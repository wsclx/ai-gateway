import asyncio
import logging
from typing import List, Dict
from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
# import numpy as np  # TODO: Install numpy in requirements.txt

from app.core.config import settings
from app.models.training import TrainingDocument, DocumentChunk
from app.schemas.training import DocumentUpload

logger = logging.getLogger(__name__)


class ContextManager:
    """Manages context injection for assistants without sending data to providers"""
    
    def __init__(self):
        self.chunk_size = 2000  # tokens
        self.max_chunks = 10
        
    async def add_training_data(
        self,
        db: AsyncSession,
        assistant_id: str,
        documents: List[DocumentUpload],
        metadata: Dict = None
    ) -> List[TrainingDocument]:
        """Process and store training documents locally"""
        
        results = []
        for doc_data in documents:
            try:
                # 1. Save document to filesystem
                file_path = await self._save_document(doc_data)
                
                # 2. Create database record
                db_doc = TrainingDocument(
                    assistant_id=assistant_id,
                    filename=doc_data.filename,
                    content_type=doc_data.content_type,
                    file_size=doc_data.file_size,
                    file_path=file_path,
                    status="uploaded",
                    metadata_json=metadata or {}
                )
                db.add(db_doc)
                await db.commit()
                await db.refresh(db_doc)
                
                # 3. Process document asynchronously
                asyncio.create_task(self._process_document(db, db_doc.id))
                
                results.append(db_doc)
                
            except Exception as e:
                logger.error(f"Failed to process document {doc_data.filename}: {e}")
                continue
                
        return results
    
    async def _save_document(self, doc_data: DocumentUpload) -> str:
        """Save uploaded document to filesystem"""
        upload_dir = Path(settings.UPLOAD_DIR) / "training"
        upload_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = upload_dir / f"{doc_data.filename}"
        with open(file_path, "wb") as f:
            f.write(doc_data.content)
            
        return str(file_path)
    
    async def _process_document(self, db: AsyncSession, document_id: str):
        """Process document: extract text, chunk, generate embeddings"""
        try:
            # Get document
            doc = await db.get(TrainingDocument, document_id)
            if not doc:
                return
                
            # 1. Extract text
            content = await self._extract_text(doc.file_path, doc.content_type)
            
            # 2. Chunk text
            chunks = self._chunk_text(content, self.chunk_size)
            
            # 3. Generate embeddings (simulated for now)
            embeddings = await self._generate_embeddings(chunks)
            
            # 4. Store chunks in database
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                db_chunk = DocumentChunk(
                    document_id=doc.id,
                    chunk_index=i,
                    content=chunk,
                    embedding=embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
                    metadata_json={"chunk_size": len(chunk)}
                )
                db.add(db_chunk)
            
            # Update document status
            doc.status = "processed"
            doc.processed_at = func.now()
            await db.commit()
            
            logger.info(f"Processed document {doc.filename}: {len(chunks)} chunks")
            
        except Exception as e:
            logger.error(f"Failed to process document {document_id}: {e}")
            # Update status to failed
            doc.status = "failed"
            await db.commit()
    
    async def _extract_text(self, file_path: str, content_type: str) -> str:
        """Extract text from various document formats"""
        try:
            if content_type == "text/plain":
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read()
            elif content_type == "application/pdf":
                return await self._extract_pdf_text(file_path)
            elif content_type in ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
                return await self._extract_docx_text(file_path)
            else:
                # Fallback to text
                with open(file_path, "r", encoding="utf-8") as f:
                    return f.read()
        except Exception as e:
            logger.error(f"Failed to extract text from {file_path}: {e}")
            return ""
    
    async def _extract_pdf_text(self, file_path: str) -> str:
        """Extract text from PDF (simplified implementation)"""
        # TODO: Implement proper PDF extraction with PyPDF2 or pdfplumber
        return f"PDF content from {file_path}"
    
    async def _extract_docx_text(self, file_path: str) -> str:
        """Extract text from DOCX (simplified implementation)"""
        # TODO: Implement proper DOCX extraction with python-docx
        return f"DOCX content from {file_path}"
    
    def _chunk_text(self, text: str, max_tokens: int) -> List[str]:
        """Split text into chunks"""
        # Simple chunking by sentences and token count
        sentences = text.split('. ')
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) < max_tokens:
                current_chunk += sentence + ". "
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = sentence + ". "
        
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
    
    async def _generate_embeddings(self, chunks: List[str]) -> List[List[float]]:
        """Generate embeddings for text chunks (simulated)"""
        # TODO: Implement with sentence-transformers
        # For now, return random embeddings
        embeddings = []
        for chunk in chunks:
            # Generate 768-dimensional embedding (standard size)
            import random
            embedding = [random.random() for _ in range(768)]
            embeddings.append(embedding)
        return embeddings
    
    async def get_relevant_context(
        self, 
        db: AsyncSession,
        assistant_id: str,
        query: str,
        max_tokens: int = 4000
    ) -> str:
        """Retrieve relevant context for a query"""
        
        try:
            # 1. Generate query embedding
            query_embedding = await self._generate_embedding(query)
            
            # 2. Vector similarity search in PostgreSQL
            relevant_chunks = await self._search_similar_chunks(
                db, assistant_id, query_embedding, limit=self.max_chunks
            )
            
            # 3. Build context within token limit
            context = self._build_context(relevant_chunks, max_tokens)
            
            return context
            
        except Exception as e:
            logger.error(f"Failed to get context for query: {e}")
            return ""
    
    async def _generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        # TODO: Implement with sentence-transformers
        import random
        return [random.random() for _ in range(768)]
    
    async def _search_similar_chunks(
        self, 
        db: AsyncSession, 
        assistant_id: str, 
        query_embedding: List[float],
        limit: int = 10
    ) -> List[DocumentChunk]:
        """Search for similar chunks using vector similarity"""
        
        # Get all chunks for the assistant
        query = select(DocumentChunk).join(TrainingDocument).where(
            TrainingDocument.assistant_id == assistant_id,
            TrainingDocument.status == "processed"
        ).limit(limit)
        
        result = await db.execute(query)
        chunks = result.scalars().all()
        
        # TODO: Implement proper vector similarity search with pgvector
        # For now, return chunks in order
        return list(chunks)
    
    def _build_context(self, chunks: List[DocumentChunk], max_tokens: int) -> str:
        """Build context string from chunks within token limit"""
        context_parts = []
        current_length = 0
        
        for chunk in chunks:
            chunk_length = len(chunk.content.split())
            if current_length + chunk_length <= max_tokens // 4:  # Reserve space for query
                context_parts.append(chunk.content)
                current_length += chunk_length
            else:
                break
                
        return "\n\n".join(context_parts)
    
    async def get_training_stats(self, db: AsyncSession, assistant_id: str) -> Dict:
        """Get training statistics for an assistant"""
        
        # Count documents
        doc_query = select(func.count(TrainingDocument.id)).where(
            TrainingDocument.assistant_id == assistant_id
        )
        doc_count = await db.scalar(doc_query)
        
        # Count chunks
        chunk_query = select(func.count(DocumentChunk.id)).join(TrainingDocument).where(
            TrainingDocument.assistant_id == assistant_id
        )
        chunk_count = await db.scalar(chunk_query)
        
        # Count processed documents
        processed_query = select(func.count(TrainingDocument.id)).where(
            TrainingDocument.assistant_id == assistant_id,
            TrainingDocument.status == "processed"
        )
        processed_count = await db.scalar(processed_query)
        
        return {
            "total_documents": doc_count or 0,
            "total_chunks": chunk_count or 0,
            "processed_documents": processed_count or 0,
            "processing_status": "active" if processed_count < doc_count else "complete"
        }
