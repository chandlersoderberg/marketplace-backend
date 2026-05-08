const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

/**
 * Generates a PDF containing product details, its brands, and the total price.
 * Pipes the resulting PDF directly to the provided Express response object.
 * 
 * @param {Object} product - The mongoose Product document
 * @param {Object} res - Express response object
 */
const generateProductPdf = (product, res) => {
  // Initialize a new PDF document
  const doc = new PDFDocument({ margin: 50 });

  // Pipe the document to the response
  doc.pipe(res);

  // --- Title & Basic Info ---
  doc.fontSize(20).text('Product Details', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).font('Helvetica-Bold').text(`Name: `, { continued: true });
  doc.font('Helvetica').text(product.productName);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text(`Description: `, { continued: true });
  doc.font('Helvetica').text(product.productDescription);
  doc.moveDown(2);

  // --- Brands Section ---
  doc.fontSize(16).font('Helvetica-Bold').text('Associated Brands', { underline: true });
  doc.moveDown();

  let totalPrice = 0;

  product.brands.forEach((brand, index) => {
    // Add brand price to total
    totalPrice += brand.price;

    doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${brand.brandName}`);
    doc.moveDown(0.5);
    doc.font('Helvetica').text(`Detail: ${brand.detail}`);
    doc.moveDown(0.5);
    doc.text(`Price: $${brand.price.toFixed(2)}`);
    doc.moveDown(0.5);

    // Try to attach the image
    // Note: brand.image contains the relative path e.g. "/uploads/brands/filename.jpg"
    const imagePath = path.join(__dirname, '..', 'public', brand.image);
    
    if (fs.existsSync(imagePath)) {
      try {
        // Draw the image with a defined width
        doc.image(imagePath, { width: 150 });
        doc.moveDown();
      } catch (err) {
        // If image format is unsupported by PDFKit, it might throw an error
        doc.text('[Image attached but unsupported format or corrupted]');
      }
    } else {
      doc.text('[Image not found on server]');
    }

    doc.moveDown(2);
  });

  // --- Footer: Total Price ---
  // Draw a line before total price
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown();

  doc.fontSize(16).font('Helvetica-Bold').text(`Total Price: $${totalPrice.toFixed(2)}`, { align: 'right' });

  // Finalize the PDF and end the stream
  doc.end();
};

module.exports = generateProductPdf;
