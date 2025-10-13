# Complaint Management System

## Project Abstract
The Complaint Management System is a centralized platform designed to effectively handle complaints within organizations such as colleges, companies, or residential communities. Traditional complaint management often relies on inefficient methods like handwritten logs or informal communication, which can lead to delays, unresolved issues, and poor accountability. This system streamlines the entire complaint lifecycle by allowing users to submit categorized concerns and enabling administrators to track, manage, and resolve them in an organized manner.

The platform ensures transparency by monitoring each complaint through various stages, including submission, review, action, and closure. It helps reduce the chances of complaints being overlooked and provides users with clear status updates. By maintaining a structured record of all issues, the system allows organizations to identify recurring problems and improve service quality through data-driven insights. This solution enhances user satisfaction by fostering a culture of accountability and improving communication between users and management.

## Team Members & Roles
This project was developed by a team of three, with responsibilities divided as follows:

- **Swathi Menon (Admin Frontend Developer):** Responsible for the entire admin dashboard interface, including the tabbed view for active/history, sorting functionality, and all related styling and client-side logic.
- **Vasudev V (User Frontend & Auth Developer):** Responsible for the user-facing components, including the sign-in page, the user dashboard for submitting complaints, and viewing personal complaint history.
- **Thanvi Sreenivasan (Backend & Database Developer):** Responsible for all server-side logic, creating and managing the API endpoints, database schema design, and handling user authentication and session management.

## Key Features

### Dual Dashboards
Separate, tailored interfaces for regular users and administrators.

### User Functionality
- Secure user sign-in.
- A simple form to lodge new complaints with categories.
- A personal dashboard to view the status and resolution messages for all submitted complaints.

### Admin Functionality
- **Active Complaints Tab:** View all "Submitted" and "In Review" complaints.  
- **History Tab:** View all "Resolved" complaints.  
- **Status Management:** Update complaint status from "Submitted" to "In Review" or "Resolved".  
- **Automatic Archiving:** Complaints marked as "Resolved" are automatically moved to the history tab.  
- **Sorting:** Sort complaints in both active and history tabs by newest or oldest.  
- **Resolution Messaging:** Add a resolution message to any complaint.

## Tech Stack

**Frontend:** HTML, CSS, Vanilla JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MySQL

**Key Node.js Packages:**
- `express`: For the web server framework.  
- `mysql2`: To connect to the MySQL database.  
- `bcrypt`: For secure password hashing.  
- `express-session`: For managing user sessions.  
- `uuid`: To generate unique IDs for complaints.

## Getting Started
Follow these instructions to get a local copy of the project up and running.

### Prerequisites
- **Node.js:** Make sure you have Node.js and npm installed.
- **MySQL:** You need a running MySQL server.

### 1. Clone the Repository
```bash
git clone https://github.com/Vasu-uu/Complaint-Management-System.git
cd Complaint-Management-System
```

### 2. Install Dependencies
In the project's root directory (where `package.json` is located), run the following command to install all required backend packages:
```bash
npm install
```

### 3. Set Up the Database
You need to create a database and the necessary tables.

1. Connect to your MySQL server.  
2. Create a new database:
```sql
CREATE DATABASE complaint_db;
```
3. Use the new database:
```sql
USE complaint_db;
```
4. Create the `users` and `complaints` tables using the following schemas:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

```sql
CREATE TABLE complaints (
    id CHAR(36) PRIMARY KEY,
    userId INT,
    Category VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    Status VARCHAR(50) DEFAULT 'Submitted',
    submissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolutionMessage TEXT,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Note:** You will need to manually insert at least one admin user and one regular user into the `users` table to test both dashboards.

### 4. Configure the Server
Open the `server.js` file and update the database connection details with your own MySQL credentials:

```js
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'your_mysql_password', // Replace with your password
    database: 'complaint_db'
});
```

### 5. Run the Application
Start the server from the root directory:

```bash
node server.js
```

The application should now be running at [http://localhost:3000](http://localhost:3000).

---

**Author:** Vasudev V  
**Project:** Complaint Management System
