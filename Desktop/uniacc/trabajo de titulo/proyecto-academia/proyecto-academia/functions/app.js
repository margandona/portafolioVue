// ... existing code ...

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const courseRoutes = require('./routes/course');
const enrollmentRoutes = require('./routes/enrollment');
const salesRoutes = require('./routes/sales');  
const campaignRoutes = require('./routes/campaign'); // Agregar esta línea
const moodleRoutes = require('./routes/moodle'); // New import

// ... existing code ...

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/sales', salesRoutes);  
app.use('/api/campaigns', campaignRoutes); // Agregar esta línea
app.use('/api/moodle', moodleRoutes); // New route

// ... existing code ...
