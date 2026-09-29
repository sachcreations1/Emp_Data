import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const exportBulkPDF = async (employees: any[]) => {
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const cardWidth = 85.6;
  const cardHeight = 54;
  const margin = 10;
  let x = margin;
  let y = margin;

  // Create a hidden container for rendering cards
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  document.body.appendChild(container);

  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i];
    
    // Create a temporary element to render the card
    const cardEl = document.createElement('div');
    cardEl.innerHTML = `
      <div style="width: ${cardWidth}mm; height: ${cardHeight}mm; border: 1px solid #eee; padding: 5mm; font-size: 10px; font-family: sans-serif; display: flex; flex-direction: column; background-color: white; border-radius: 3.18mm; overflow: hidden; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 5mm;">
          <img src="${emp.photo || `https://api.dicebear.com/8.x/initials/svg?seed=${emp.name}`}" style="border-radius: 50%; object-fit: cover; width: 20mm; height: 20mm; border: 2px solid #0f172a;" crossorigin="anonymous" />
          <div style="display: flex; flex-direction: column;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0; color: #0f172a;">${emp.name}</h3>
            <p style="font-size: 11px; margin: 4px 0 0 0; color: #64748b;">ID: ${emp.empId}</p>
          </div>
        </div>
        <div style="margin-top: auto; text-align: center; opacity: 0.5; font-size: 8px;">StaffLink &copy; 2024</div>
      </div>
    `;
    container.appendChild(cardEl);
    
    const canvas = await html2canvas(cardEl.firstChild as HTMLElement, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    
    if (y + cardHeight > pdf.internal.pageSize.height - margin) {
        pdf.addPage();
        x = margin;
        y = margin;
    }
    
    pdf.addImage(imgData, "PNG", x, y, cardWidth, cardHeight);
    
    x += cardWidth + margin;
    if (x + cardWidth > pdf.internal.pageSize.width - margin) {
        x = margin;
        y += cardHeight + margin;
    }

    container.removeChild(cardEl);
  }
  
  document.body.removeChild(container);
  pdf.save("employee_id_cards.pdf");
};
