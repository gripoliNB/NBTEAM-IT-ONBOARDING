import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import './App.css';

interface EmployeeForm {
  employeeNumber: string;
  fullName: string;
  department: string;
  startDate: string;
  softwareRequirements: string[];
}

const softwareOptions = [
  'Crear / Activar cuenta de correo electrónico corporativo',
  'Power BI',
  'Appd financiera QuickBook',
  'Avast',
  'Microsoft 365',
  'Project',
  'Teams',
  'Bamboo',
  'Acrobat',
  'Dialpad',
  'Office 365',
  'Hubspot',
  'Harverst',
  'Pamet Each',
  'SAP for ME',
  'ZOOM',
  'Solman',
  'Escritorio Virtual (AWS)',
  'Acceso a impresoras y dispositivos'
];

const App: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeForm>({
    employeeNumber: '',
    fullName: '',
    department: '',
    startDate: '',
    softwareRequirements: []
  });

  const [message, setMessage] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSoftwareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      softwareRequirements: checked
        ? [...prev.softwareRequirements, value]
        : prev.softwareRequirements.filter(item => item !== value)
    }));
  };

  const generateWordDocument = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "FORMULARIO DE EMPLEADO",
            heading: HeadingLevel.TITLE,
            alignment: "center"
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Número de Empleado: ",
                bold: true
              }),
              new TextRun({
                text: formData.employeeNumber
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Nombre Completo: ",
                bold: true
              }),
              new TextRun({
                text: formData.fullName
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Departamento: ",
                bold: true
              }),
              new TextRun({
                text: formData.department
              })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Fecha de Inicio: ",
                bold: true
              }),
              new TextRun({
                text: formData.startDate
              })
            ]
          }),
          new Paragraph({ text: "" }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Software Requerido:",
                bold: true
              })
            ]
          }),
          ...formData.softwareRequirements.map(software => 
            new Paragraph({
              children: [
                new TextRun({
                  text: "• " + software
                })
              ]
            })
          ),
          new Paragraph({ text: "" }),
          new Paragraph({
            text: `Documento generado el ${new Date().toLocaleDateString('es-ES')}`,
            alignment: "right"
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `Empleado_${formData.employeeNumber}_${formData.fullName.replace(/\s+/g, '_')}.docx`;
    saveAs(blob, fileName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.employeeNumber || !formData.fullName || !formData.department || !formData.startDate) {
      setMessage('Por favor, completa todos los campos obligatorios.');
      return;
    }

    if (formData.softwareRequirements.length === 0) {
      setMessage('Por favor, selecciona al menos un software requerido.');
      return;
    }

    generateWordDocument();
    setMessage('¡Documento Word generado exitosamente!');
    
    // Limpiar formulario después de generar el documento
    setTimeout(() => {
      setFormData({
        employeeNumber: '',
        fullName: '',
        department: '',
        startDate: '',
        softwareRequirements: []
      });
      setMessage('');
    }, 2000);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Formulario de Empleado</h1>
        
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="employeeNumber">Número de Empleado *</label>
            <input
              type="text"
              id="employeeNumber"
              name="employeeNumber"
              value={formData.employeeNumber}
              onChange={handleInputChange}
              required
              placeholder="Ej: EMP001"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo *</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              placeholder="Ej: Juan Pérez García"
            />
          </div>

          <div className="form-group">
            <label htmlFor="department">Departamento *</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecciona un departamento</option>
              <option value="Desarrollo">Desarrollo</option>
              <option value="Marketing">Marketing</option>
              <option value="Finanzas">Finanzas</option>
              <option value="RRHH">RRHH</option>
              <option value="Operaciones">Operaciones</option>
              <option value="IT">IT</option>
              <option value="Ventas">Ventas</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Fecha de Inicio *</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Software Requerido *</label>
            <div className="software-list">
              {softwareOptions.map((software, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={software}
                    checked={formData.softwareRequirements.includes(software)}
                    onChange={handleSoftwareChange}
                  />
                  <span className="checkbox-text">{software}</span>
                </label>
              ))}
            </div>
          </div>

          {message && (
            <div className={`message ${message.includes('exitosamente') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Generar Documento Word
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;