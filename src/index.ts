import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Datos de ejemplo en memoria (para demo)
let onboardings = [
  {
    id: "1",
    employeeNumber: "EMP001",
    fullName: "Juan Pérez García",
    department: "Desarrollo",
    startDate: "2024-01-15",
    softwareRequirements: ["email", "microsoft365", "teams"],
    otherSoftware: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@company.com",
    updatedBy: null,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null
  },
  {
    id: "2",
    employeeNumber: "EMP002",
    fullName: "María López Rodríguez",
    department: "Marketing",
    startDate: "2024-01-20",
    softwareRequirements: ["email", "office365", "hubspot"],
    otherSoftware: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "admin@company.com",
    updatedBy: null,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null
  }
];

const SOFTWARE_CATALOG = [
  { id: 'email', name: 'Crear / Activar cuenta de correo electrónico corporativo' },
  { id: 'powerbi', name: 'Power BI' },
  { id: 'quickbook', name: 'Appd financiera QuickBook' },
  { id: 'avast', name: 'Avast' },
  { id: 'microsoft365', name: 'Microsoft 365' },
  { id: 'project', name: 'Project' },
  { id: 'teams', name: 'Teams' },
  { id: 'bamboo', name: 'Bamboo' },
  { id: 'acrobat', name: 'Acrobat' },
  { id: 'dialpad', name: 'Dialpad' },
  { id: 'office365', name: 'Office 365' },
  { id: 'hubspot', name: 'Hubspot' },
  { id: 'harvest', name: 'Harverst' },
  { id: 'pamet', name: 'Pamet Each' },
  { id: 'sap', name: 'SAP for ME' },
  { id: 'zoom', name: 'ZOOM' },
  { id: 'solman', name: 'Solman' },
  { id: 'aws', name: 'Escritorio Virtual (AWS)' },
  { id: 'printers', name: 'Acceso a impresoras y dispositivos' },
  { id: 'other', name: 'Other' }
];

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Obtener catálogo de software
app.get('/api/software-catalog', (req, res) => {
  res.json({
    success: true,
    data: SOFTWARE_CATALOG
  });
});

// Crear onboarding
app.post('/api/onboardings', (req, res) => {
  try {
    const { employeeNumber, fullName, department, startDate, softwareRequirements, otherSoftware } = req.body;

    // Validaciones básicas
    if (!employeeNumber || !fullName || !department || !startDate) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos obligatorios'
      });
    }

    // Verificar si ya existe
    const existing = onboardings.find(o => o.employeeNumber === employeeNumber && !o.isDeleted);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Employee number already exists'
      });
    }

    const newOnboarding = {
      id: Date.now().toString(),
      employeeNumber,
      fullName,
      department,
      startDate,
      softwareRequirements: softwareRequirements || [],
      otherSoftware: otherSoftware || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'admin@company.com',
      updatedBy: null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null
    };

    onboardings.push(newOnboarding);

    res.status(201).json({
      success: true,
      data: newOnboarding,
      message: 'Onboarding created successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener todos los onboardings
app.get('/api/onboardings', (req, res) => {
  try {
    const { q, department, page = 1, size = 10, sort = '-startDate' } = req.query;
    
    let filteredOnboardings = onboardings.filter(o => !o.isDeleted);

    // Filtros
    if (q) {
      const searchTerm = (q as string).toLowerCase();
      filteredOnboardings = filteredOnboardings.filter(o => 
        o.employeeNumber.toLowerCase().includes(searchTerm) ||
        o.fullName.toLowerCase().includes(searchTerm) ||
        o.department.toLowerCase().includes(searchTerm)
      );
    }

    if (department) {
      filteredOnboardings = filteredOnboardings.filter(o => 
        o.department.toLowerCase().includes((department as string).toLowerCase())
      );
    }

    // Ordenamiento
    filteredOnboardings.sort((a, b) => {
      if (sort === '-startDate') {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    // Paginación
    const startIndex = (Number(page) - 1) * Number(size);
    const endIndex = startIndex + Number(size);
    const paginatedData = filteredOnboardings.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        page: Number(page),
        size: Number(size),
        total: filteredOnboardings.length,
        totalPages: Math.ceil(filteredOnboardings.length / Number(size))
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Obtener onboarding por employee number
app.get('/api/onboardings/:employeeNumber', (req, res) => {
  try {
    const { employeeNumber } = req.params;
    const onboarding = onboardings.find(o => 
      o.employeeNumber === employeeNumber && !o.isDeleted
    );

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding record not found'
      });
    }

    res.json({
      success: true,
      data: onboarding
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Actualizar onboarding
app.put('/api/onboardings/:employeeNumber', (req, res) => {
  try {
    const { employeeNumber } = req.params;
    const updateData = req.body;

    const index = onboardings.findIndex(o => 
      o.employeeNumber === employeeNumber && !o.isDeleted
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding record not found'
      });
    }

    onboardings[index] = {
      ...onboardings[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
      updatedBy: 'admin@company.com'
    };

    res.json({
      success: true,
      data: onboardings[index],
      message: 'Onboarding updated successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Eliminar onboarding (soft delete)
app.delete('/api/onboardings/:employeeNumber', (req, res) => {
  try {
    const { employeeNumber } = req.params;

    const index = onboardings.findIndex(o => 
      o.employeeNumber === employeeNumber && !o.isDeleted
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Onboarding record not found'
      });
    }

    onboardings[index] = {
      ...onboardings[index],
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: 'admin@company.com'
    };

    res.json({
      success: true,
      message: 'Onboarding deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Exportar CSV
app.get('/api/onboardings/export', (req, res) => {
  try {
    const { department } = req.query;
    
    let filteredOnboardings = onboardings.filter(o => !o.isDeleted);

    if (department) {
      filteredOnboardings = filteredOnboardings.filter(o => 
        o.department.toLowerCase().includes((department as string).toLowerCase())
      );
    }

    // Crear CSV
    const csvHeader = 'Employee Number,Full Name,Department,Start Date,Software Requirements,Other Software,Created At,Updated At\n';
    const csvRows = filteredOnboardings.map(onboarding => {
      const softwareList = Array.isArray(onboarding.softwareRequirements) 
        ? onboarding.softwareRequirements.join('; ') 
        : onboarding.softwareRequirements;
      return `"${onboarding.employeeNumber}","${onboarding.fullName}","${onboarding.department}","${onboarding.startDate}","${softwareList}","${onboarding.otherSoftware || ''}","${onboarding.createdAt}","${onboarding.updatedAt}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="onboardings.csv"');
    res.send(csvHeader + csvRows);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Manejo de errores
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
});

export default app;