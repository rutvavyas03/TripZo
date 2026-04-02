// tripZo Rider - Complete JavaScript Functionality
class TripZoApp {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('tripzo_users')) || [];
        this.rides = JSON.parse(localStorage.getItem('tripzo_rides')) || [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadDefaultData();
        this.updateNav();
    }

    // Initialize default data
    loadDefaultData() {
        if (this.users.length === 0) {
            this.users = [
                {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    phone: '+1-555-0123',
                    password: 'password123',
                    totalRides: 12,
                    totalDistance: 156,
                    avgRating: 4.8
                }
            ];
            localStorage.setItem('tripzo_users', JSON.stringify(this.users));
        }
    }

    // Authentication
    checkAuth() {
        const user = localStorage.getItem('tripzo_current_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            document.getElementById('loginBtn')?.classList.add('hidden');
            document.getElementById('userInfo')?.classList.remove('hidden');
            this.updateUserInfo();
        }
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('tripzo_current_user', JSON.stringify(user));
            this.showNotification('Login successful!', 'success');
            this.redirectToHome();
            return true;
        } else {
            this.showNotification('Invalid credentials!', 'error');
            return false;
        }
    }

    register(userData) {
        // Check if user already exists
        if (this.users.find(u => u.email === userData.email)) {
            this.showNotification('Email already registered!', 'error');
            return false;
        }

        const newUser = {
            id: Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            totalRides: 0,
            totalDistance: 0,
            avgRating: 0
        };

        this.users.push(newUser);
        localStorage.setItem('tripzo_users', JSON.stringify(this.users));
        this.showNotification('Registration successful! Please login.', 'success');
        window.location.href = 'login.html';
        return true;
    }

    logout() {
        localStorage.removeItem('tripzo_current_user');
        this.currentUser = null;
        this.showNotification('Logged out successfully!', 'success');
        window.location.href = 'index.html';
    }

    // Ride Booking
    bookRide(rideData) {
        if (!this.currentUser) {
            this.showNotification('Please login to book a ride!', 'error');
            window.location.href = 'login.html';
            return;
        }

        const ride = {
            id: Date.now(),
            userId: this.currentUser.id,
            pickup: rideData.pickup,
            destination: rideData.destination,
            date: rideData.date,
            time: rideData.time,
            rideType: rideData.rideType,
            status: 'confirmed',
            price: this.calculatePrice(rideData.rideType),
            createdAt: new Date().toISOString()
        };

        this.rides.unshift(ride);
        localStorage.setItem('tripzo_rides', JSON.stringify(this.rides));

        // Update user stats
        this.currentUser.totalRides++;
        this.updateUserStats();

        this.showNotification('Ride booked successfully!', 'success');
        window.location.href = 'my-rides.html';
    }

    calculatePrice(rideType) {
        const prices = {
            economy: 12.50,
            comfort: 18.75,
            luxury: 35.00
        };
        return prices[rideType] || 12.50;
    }

    // UI Updates
    updateNav() {
        if (this.currentUser) {
            document.getElementById('userName') && (document.getElementById('userName').textContent = this.currentUser.firstName);
            document.getElementById('profileName') && (document.getElementById('profileName').textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`);
            document.getElementById('profileEmail') && (document.getElementById('profileEmail').textContent = this.currentUser.email);
            
            // Enable booking button
            const bookBtn = document.getElementById('bookBtn');
            if (bookBtn) {
                bookBtn.disabled = false;
                bookBtn.textContent = 'Book Ride Now';
            }
        }
    }

    updateUserInfo() {
        document.querySelectorAll('#userName').forEach(el => {
            el.textContent = this.currentUser.firstName;
        });
        
        if (document.getElementById('totalRides')) {
            document.getElementById('totalRides').textContent = this.currentUser.totalRides;
            document.getElementById('totalDistance').textContent = this.currentUser.totalDistance;
            document.getElementById('avgRating').textContent = this.currentUser.avgRating;
        }
    }

    updateUserStats() {
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.currentUser };
            localStorage.setItem('tripzo_users', JSON.stringify(this.users));
            localStorage.setItem('tripzo_current_user', JSON.stringify(this.currentUser));
        }
    }

    // Rides Management
    getUserRides() {
        if (!this.currentUser) return [];
        return this.rides.filter(ride => ride.userId === this.currentUser.id);
    }

    renderRides(rides = []) {
        const ridesList = document.getElementById('ridesList');
        if (!ridesList) return;

        if (rides.length === 0) {
            ridesList.innerHTML = '<p class="no-rides">No rides found. <a href="book-ride.html">Book your first ride!</a></p>';
            return;
        }

        ridesList.innerHTML = rides.map(ride => `
            <div class="ride-card ${ride.status}">
                <div class="ride-header">
                    <div>
                        <h4>${ride.pickup} → ${ride.destination}</h4>
                        <p>${new Date(ride.date).toLocaleDateString()} at ${ride.time}</p>
                    </div>
                    <span class="status-badge status-${ride.status}">${ride.status.toUpperCase()}</span>
                </div>
                <div class="ride-details">
                    <div class="ride-type">${ride.rideType.toUpperCase()}</div>
                    <div class="ride-price">$${ride.price.toFixed(2)}</div>
                </div>
                <div class="ride-actions">
                    ${ride.status === 'confirmed' ? '<button class="btn-cancel">Cancel Ride</button>' : ''}
                </div>
            </div>
        `).join('');
    }

    // Navigation & Events
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                app.login(email, password);
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const userData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('registerEmail').value,
                    phone: document.getElementById('phone').value,
                    password: document.getElementById('registerPassword').value
                };
                app.register(userData);
            });
        }

        // Booking form
        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const rideData = {
                    pickup: document.getElementById('pickup').value,
                    destination: document.getElementById('destination').value,
                    date: document.getElementById('rideDate').value,
                    time: document.getElementById('rideTime').value,
                    rideType: document.querySelector('input[name="rideType"]:checked').value
                };
                app.bookRide(rideData);
            });

            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('rideDate').value = today;
        }

        // Logout buttons
        document.querySelectorAll('#logoutBtn').forEach(btn => {
            btn?.addEventListener('click', (e) => {
                e.preventDefault();
                app.logout();
            });
        });

        // Rides filter
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn?.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                app.filterRides(btn.dataset.filter);
            });
        });

        // My Rides page load
        if (document.getElementById('ridesList')) {
            this.loadRides();
        }
    }

    loadRides() {
        const userRides = this.getUserRides();
        this.renderRides(userRides);
    }

    filterRides(filter) {
        const userRides = this.getUserRides();
        let filteredRides = userRides;

        switch (filter) {
            case 'upcoming':
                filteredRides = userRides.filter(ride => new Date(ride.date + ' ' + ride.time) > new Date());
                break;
            case 'completed':
                filteredRides = userRides.filter(ride => ride.status === 'completed');
                break;
            case 'cancelled':
                filteredRides = userRides.filter(ride => ride.status === 'cancelled');
                break;
        }

        this.renderRides(filteredRides);
    }

    redirectToHome() {
        setTimeout(() => {
            if (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html')) {
                window.location.href = 'index.html';
            }
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            ${message}
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app
const app = new TripZoApp();

// Utility functions
function updateActiveNav() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// Update nav on page load
document.addEventListener('DOMContentLoaded', updateActiveNav);

// Listen for user changes across pages
window.addEventListener('storage', (e) => {
    if (e.key === 'tripzo_current_user') {
        window.location.reload();
    }
});