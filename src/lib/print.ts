
export const printCard = (elementId: string) => {
    const printContent = document.getElementById(elementId);
  
    if (!printContent) {
      alert("Could not find printable card content.");
      return;
    }
  
    // Create a new window or iframe to print
    const printWindow = window.open('', '_blank', 'width=800,height=600');
  
    if (!printWindow) {
      alert("Could not open print window. Please disable your popup blocker.");
      return;
    }
  
    printWindow.document.write('<html><head><title>Print ID Card</title>');
    // It's crucial to include styles for printing
    printWindow.document.write('<style>');
    printWindow.document.write(`
      @media print {
        @page {
          size: 323px 512px;
          margin: 0;
        }
        body {
          margin: 0;
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
    `);
    printWindow.document.write('</style></head><body>');
    printWindow.document.write(printContent.outerHTML);
    printWindow.document.write('</body></html>');
  
    printWindow.document.close(); // Necessary for some browsers.
    
    // Use a timeout to ensure content is loaded before printing
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }, 500);
};
