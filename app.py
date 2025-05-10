from flask import Flask, render_template, request
from Database_Connection import Database
import json
import os

# For local testing with a .env file (optional on Render)
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = 'Vineeth_123'

#OAuth
app.config["SESSION_COOKIE_NAME"] = "google-login-session"

# In-memory user store (you can later switch to DB)
users = {
    'admin': {'name': 'Admin', 'email': 'admin@example.com', 'password': 'password123'}
}


@app.route('/')
def home():
    if 'user' not in session:
        return redirect(url_for('login'))
    books = json.load(open('./static/books/books_Data.json'))
    return render_template('home.html', books=books,username=session['user'])


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['username']
        pwd = request.form['password']

        #fetching user data from database
        connect_obj=Database()
        user_data=connect_obj.get_user_by_name(email)
        print(user_data)
        if user_data[3] == str(pwd):
            session.permanent = True
            session['user'] = user_data[1]
            session['cart'] = []
            return redirect(url_for('home'))
        else:
            return render_template('login.html', error='Invalid credentials')
    return render_template('login.html')

@app.route('/update-cart', methods=['POST'])
def update_cart():
    if 'user' not in session:
        return {'status': 'unauthorized'}, 401

    data = request.json
    book_id = int(data['book_id'])
    quantity = int(data['quantity'])

    db = Database()
    user = db.get_user_by_name(session.get('email'))
    print(user)
    user_id = user[0]

    if quantity > 0:
        db.upsert_cart(user_id, book_id, quantity)
    else:
        db.remove_from_cart(user_id, book_id)

    return {'status': 'updated'}


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        connect_obj=Database()
        connect_obj.insert_user(name,email,password)
        # Use email as the unique identifier
        if email in users:
            return render_template('register.html', error="Email already exists!")

        # Store new user
        users[email] = {'name': name, 'email': email, 'password': password}
        return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/cart')
def cart():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('cart.html')

@app.route('/checkout')
def checkout():
    if 'user' not in session:
        return redirect(url_for('login'))
    return render_template('checkout.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

from authlib.integrations.flask_client import OAuth
from flask import url_for, redirect,session

oauth = OAuth(app)

oauth.register(
    name='google',
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',  # 🔥 correct way for OIDC
    client_kwargs={'scope': 'openid email profile'},
)


@app.route('/check')
def check():
    google=oauth.create_client('google')
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    google = oauth.create_client('google')
    token = google.authorize_access_token()
    resp = google.get('https://openidconnect.googleapis.com/v1/userinfo')
    user_info = resp.json()
    # do something with the token and profile
    print(user_info['email'])
    connect_obj = Database()
    user_data = connect_obj.get_user_by_name(user_info['email'])
    if user_data[2] == user_info['email']:
        session.permanent = True
        session['email'] = user_info['email']
        session['user'] = user_data[1]
        session['cart'] = []

        return redirect(url_for('home'))

    print(user_info['email'])
    return render_template('home.html')


if __name__ == '__main__':
    #app.run(debug=True)
    app.run(host='0.0.0.0', port=5000)
