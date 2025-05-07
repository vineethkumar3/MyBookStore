# Bookstore

# 📚 Flask Bookstore Application

This is a full-stack Flask-based Bookstore web application that supports user registration, login, book browsing, cart management, and payment simulation — all backed by a PostgreSQL database.

---

## 🚀 Features

- User Registration & Login with session handling
- Display of available books with dynamic UI
- Add-to-cart with quantity management (+/-)
- Real-time cart syncing to PostgreSQL
- Cart is cleared upon payment
- Responsive styling using CSS
- Local cart rendering powered by JavaScript
- Fully integrated with AWS-hosted PostgreSQL backend

---

## 🛠️ Tech Stack

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Database**: PostgreSQL
- **Hosting**: AWS EC2 (for database)

---

## 📦 Project Daily Update
The main objective of this project is to create a real time website to sell books. 

**User Logins**: Each users data like name, email, password was stored on PostgreSql. Same with the login validataions when user enters email and password, we collect the user details from the database basedon the email. If passwords are matched then flask assigns a session and redirect to home page.

**Login Another Method**: We implemented OAuth as a login validation. Let me explain how this works, once we click on "Login with Google" this will redirect to google auth server where it asks user to login with gmail. Once it was validated the code sends a Temp code, this application now sends this code to google auth once that code was matched it gives a session code.

**Users Data**: Once user was validated his data was fetched like cart details, the same data was given to cart and home page information.

**Render**: The render works as a backend server. Once we installed the application it gives a link.






PostgreSql was installed on EC2 to store the new users login details and each users cart details. 

