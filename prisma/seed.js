"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Clean existing data
    await prisma.food.deleteMany();
    await prisma.meal.deleteMany();
    await prisma.dailyMeal.deleteMany();
    await prisma.recommendation.deleteMany();
    await prisma.mealPlan.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    const hashedPassword = await bcryptjs_1.default.hash('Password123', 12);
    // Create Doctor
    const doctor = await prisma.user.create({
        data: {
            email: 'doctor@nutriplan.com',
            password: hashedPassword,
            name: 'Dr. Yali Rivera',
            role: 'DOCTOR',
            phone: '+34 612 345 678',
        },
    });
    console.log('👨‍⚕️ Created doctor:', doctor.email);
    // Create Patients
    const patient1 = await prisma.user.create({
        data: {
            email: 'carlos@email.com',
            password: hashedPassword,
            name: 'Carlos Rodríguez',
            role: 'PATIENT',
            phone: '+34 623 456 789',
            doctors: {
                connect: { id: doctor.id },
            },
        },
    });
    const patient2 = await prisma.user.create({
        data: {
            email: 'ana@email.com',
            password: hashedPassword,
            name: 'Ana Martínez',
            role: 'PATIENT',
            phone: '+34 634 567 890',
            doctors: {
                connect: { id: doctor.id },
            },
        },
    });
    const patient3 = await prisma.user.create({
        data: {
            email: 'pedro@email.com',
            password: hashedPassword,
            name: 'Pedro Sánchez',
            role: 'PATIENT',
            phone: '+34 645 678 901',
            doctors: {
                connect: { id: doctor.id },
            },
        },
    });
    console.log('👥 Created patients:', patient1.email, patient2.email, patient3.email);
    // Create meal plan for patient1
    const today = new Date();
    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);
    const mealPlan = await prisma.mealPlan.create({
        data: {
            title: 'Plan de Pérdida de Peso - Semana 1',
            description: 'Plan alimenticio diseñado para una pérdida de peso saludable y sostenible.',
            startDate,
            endDate,
            doctorId: doctor.id,
            patientId: patient1.id,
            isActive: true,
            dailyMeals: {
                create: [
                    {
                        dayNumber: 1,
                        dayName: 'Lunes',
                        meals: {
                            create: [
                                {
                                    type: 'BREAKFAST',
                                    name: 'Desayuno Energético',
                                    description: 'Desayuno completo para comenzar el día',
                                    calories: 350,
                                    protein: 15,
                                    carbs: 45,
                                    fats: 12,
                                    time: '08:00',
                                    foods: {
                                        create: [
                                            { name: 'Avena integral', quantity: '40g', calories: 150 },
                                            { name: 'Leche desnatada', quantity: '200ml', calories: 70 },
                                            { name: 'Plátano', quantity: '1 unidad', calories: 90 },
                                            { name: 'Nueces', quantity: '10g', calories: 65 },
                                        ],
                                    },
                                },
                                {
                                    type: 'MORNING_SNACK',
                                    name: 'Snack de Media Mañana',
                                    calories: 150,
                                    time: '11:00',
                                    foods: {
                                        create: [
                                            { name: 'Manzana', quantity: '1 unidad', calories: 80 },
                                            { name: 'Yogur natural', quantity: '125g', calories: 70 },
                                        ],
                                    },
                                },
                                {
                                    type: 'LUNCH',
                                    name: 'Almuerzo Mediterráneo',
                                    description: 'Almuerzo equilibrado con proteínas y verduras',
                                    calories: 550,
                                    protein: 35,
                                    carbs: 50,
                                    fats: 20,
                                    time: '14:00',
                                    foods: {
                                        create: [
                                            { name: 'Pechuga de pollo a la plancha', quantity: '150g', calories: 165 },
                                            { name: 'Arroz integral', quantity: '60g (peso en crudo)', calories: 210 },
                                            { name: 'Ensalada mixta', quantity: '200g', calories: 50 },
                                            { name: 'Aceite de oliva', quantity: '15ml', calories: 125 },
                                        ],
                                    },
                                },
                                {
                                    type: 'AFTERNOON_SNACK',
                                    name: 'Merienda Saludable',
                                    calories: 180,
                                    time: '17:30',
                                    foods: {
                                        create: [
                                            { name: 'Tostada integral', quantity: '1 unidad', calories: 80 },
                                            { name: 'Aguacate', quantity: '50g', calories: 80 },
                                            { name: 'Tomate cherry', quantity: '50g', calories: 20 },
                                        ],
                                    },
                                },
                                {
                                    type: 'DINNER',
                                    name: 'Cena Ligera',
                                    description: 'Cena ligera y nutritiva',
                                    calories: 400,
                                    protein: 30,
                                    carbs: 25,
                                    fats: 18,
                                    time: '20:30',
                                    foods: {
                                        create: [
                                            { name: 'Salmón al horno', quantity: '130g', calories: 250 },
                                            { name: 'Verduras asadas', quantity: '200g', calories: 100 },
                                            { name: 'Aceite de oliva', quantity: '10ml', calories: 90 },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        dayNumber: 2,
                        dayName: 'Martes',
                        meals: {
                            create: [
                                {
                                    type: 'BREAKFAST',
                                    name: 'Tostadas con Proteína',
                                    calories: 380,
                                    protein: 20,
                                    carbs: 40,
                                    fats: 15,
                                    time: '08:00',
                                    foods: {
                                        create: [
                                            { name: 'Pan integral', quantity: '2 rebanadas', calories: 160 },
                                            { name: 'Huevos revueltos', quantity: '2 unidades', calories: 180 },
                                            { name: 'Tomate', quantity: '1/2 unidad', calories: 20 },
                                        ],
                                    },
                                },
                                {
                                    type: 'LUNCH',
                                    name: 'Ensalada de Quinoa',
                                    calories: 480,
                                    protein: 25,
                                    carbs: 55,
                                    fats: 18,
                                    time: '14:00',
                                    foods: {
                                        create: [
                                            { name: 'Quinoa', quantity: '80g (peso en crudo)', calories: 280 },
                                            { name: 'Atún en conserva', quantity: '80g', calories: 100 },
                                            { name: 'Vegetales variados', quantity: '150g', calories: 50 },
                                            { name: 'Aceite de oliva', quantity: '10ml', calories: 90 },
                                        ],
                                    },
                                },
                                {
                                    type: 'DINNER',
                                    name: 'Crema de Verduras con Proteína',
                                    calories: 350,
                                    protein: 25,
                                    carbs: 30,
                                    fats: 15,
                                    time: '20:30',
                                    foods: {
                                        create: [
                                            { name: 'Crema de calabacín', quantity: '300ml', calories: 120 },
                                            { name: 'Pechuga de pavo', quantity: '100g', calories: 130 },
                                            { name: 'Queso fresco', quantity: '30g', calories: 45 },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            recommendations: {
                create: [
                    {
                        title: 'Hidratación',
                        description: 'Bebe al menos 2 litros de agua al día. Evita bebidas azucaradas y alcohol.',
                        priority: 'HIGH',
                        category: 'Hidratación',
                    },
                    {
                        title: 'Ejercicio',
                        description: 'Realiza al menos 30 minutos de actividad física moderada 5 días a la semana.',
                        priority: 'HIGH',
                        category: 'Ejercicio',
                    },
                    {
                        title: 'Descanso',
                        description: 'Duerme entre 7-8 horas por noche para optimizar el metabolismo.',
                        priority: 'MEDIUM',
                        category: 'Descanso',
                    },
                    {
                        title: 'Horarios de Comida',
                        description: 'Respeta los horarios de las comidas. No te saltes ninguna comida.',
                        priority: 'MEDIUM',
                        category: 'Hábitos',
                    },
                ],
            },
        },
    });
    console.log('📋 Created meal plan:', mealPlan.title);
    // Create another plan for patient2
    const mealPlan2 = await prisma.mealPlan.create({
        data: {
            title: 'Plan de Mantenimiento',
            description: 'Plan para mantener un peso saludable con alimentación equilibrada.',
            startDate,
            endDate,
            doctorId: doctor.id,
            patientId: patient2.id,
            isActive: true,
            dailyMeals: {
                create: [
                    {
                        dayNumber: 1,
                        dayName: 'Lunes',
                        meals: {
                            create: [
                                {
                                    type: 'BREAKFAST',
                                    name: 'Bowl de Frutas',
                                    calories: 400,
                                    time: '08:00',
                                    foods: {
                                        create: [
                                            { name: 'Yogur griego', quantity: '200g', calories: 130 },
                                            { name: 'Granola', quantity: '40g', calories: 180 },
                                            { name: 'Frutas del bosque', quantity: '100g', calories: 50 },
                                            { name: 'Miel', quantity: '10g', calories: 30 },
                                        ],
                                    },
                                },
                                {
                                    type: 'LUNCH',
                                    name: 'Pasta Integral con Verduras',
                                    calories: 600,
                                    time: '14:00',
                                    foods: {
                                        create: [
                                            { name: 'Pasta integral', quantity: '80g', calories: 280 },
                                            { name: 'Verduras salteadas', quantity: '150g', calories: 80 },
                                            { name: 'Parmesano', quantity: '20g', calories: 80 },
                                            { name: 'Aceite de oliva', quantity: '15ml', calories: 125 },
                                        ],
                                    },
                                },
                                {
                                    type: 'DINNER',
                                    name: 'Pescado con Ensalada',
                                    calories: 450,
                                    time: '20:00',
                                    foods: {
                                        create: [
                                            { name: 'Lubina al horno', quantity: '180g', calories: 200 },
                                            { name: 'Ensalada verde', quantity: '150g', calories: 40 },
                                            { name: 'Patata asada', quantity: '100g', calories: 120 },
                                            { name: 'Aceite de oliva', quantity: '10ml', calories: 90 },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            recommendations: {
                create: [
                    {
                        title: 'Variedad Alimentaria',
                        description: 'Incluye todos los grupos alimenticios en tu dieta diaria.',
                        priority: 'MEDIUM',
                        category: 'Nutrición',
                    },
                    {
                        title: 'Control de Porciones',
                        description: 'Mantén las porciones indicadas para evitar excesos.',
                        priority: 'MEDIUM',
                        category: 'Hábitos',
                    },
                ],
            },
        },
    });
    console.log('📋 Created meal plan:', mealPlan2.title);
    console.log('✅ Seed completed successfully!');
    console.log('\n📧 Login credentials:');
    console.log('   Doctor: doctor@nutriplan.com / Password123');
    console.log('   Patient 1: carlos@email.com / Password123');
    console.log('   Patient 2: ana@email.com / Password123');
    console.log('   Patient 3: pedro@email.com / Password123');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map