"use server";
import {PDFParse}  from "pdf-parse";
export async function chunkDocument(doc:File){
   const bytes = await doc.arrayBuffer();
   const processedPDF = new PDFParse(new Uint8Array(bytes));
   const data = await processedPDF.getText();
   return data.text;
}