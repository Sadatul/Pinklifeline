// utils/generatePDF.js
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePDF = async (elementId) => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 width in mm
  const pageHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;
  console.log("image data", imgData);

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save('prescription.pdf');
};


export const getImage = async (elementId) => {
  const input = document.getElementById(elementId);
  const canvas = await html2canvas(input);
  return canvas.toDataURL('image/png');
};