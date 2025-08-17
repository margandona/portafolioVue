// ... existing code ...

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const salesRoutes = require('./routes/sales');  
const campaignRoutes = require('./routes/campaign'); // Agregar esta línea
const moodleRoutes = require('./routes/moodle'); // New import
const paymentRoutes = require('./routes/payments'); // Payment routes

// ... existing code ...

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/sales', salesRoutes);  
app.use('/api/campaigns', campaignRoutes); // Agregar esta línea
app.use('/api/moodle', moodleRoutes); // New route
app.use('/api/payments', paymentRoutes); // Payment routes

// ... existing code ...
