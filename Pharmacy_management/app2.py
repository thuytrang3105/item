# app.py
from flask import Flask, render_template, request, redirect, url_for, flash
from extensions import db  # Import db từ extensions.py
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from models import User,Medicine, Customer, Invoice
from datetime import datetime
from functools import wraps
import json 

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharmacy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.secret_key= ' your_secret_key'

# Liên kết SQLAlchemy với Flask app
db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

#login
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return render_template('home_manager.html')

    return render_template('login.html')

#logout
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Bạn đã đăng xuất!', 'info')
    return redirect(url_for('login'))


# Tạo các bảng cơ sở dữ liệu nếu chưa có
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/manager')
def manager():
    return render_template('home_manager.html')

@app.route('/employee')
def dashboard():
    return render_template('home_employee.html')

@app.route('/medicines')
def list_medicines ():
    medicines = Medicine.query.all()
    return render_template('list_medicines.html', medicines=medicines)

#Thêm Thuốc
@app.route('/add_medicine', methods=['GET', 'POST'])
def add_medicine():
    if request.method == 'POST':
        name = request.form['name']
        price = float(request.form['price'])
        quantity = int(request.form['quantity'])
        expiry_date = request.form['expiry_date']
        description = request.form['description']
        # Lưu thuốc vào cơ sở dữ liệu
        new_medicine = Medicine(name=name, price=price, quantity=quantity, expiry_date=expiry_date)
        db.session.add(new_medicine)
        db.session.commit()
        # Ghi thông tin description và name vào file JSON
        data = {"name_medicine": name, "description": description, "price": price}
        
        try:
            # Đọc dữ liệu cũ nếu file tồn tại
            with open('medicine.json', 'r',encoding='utf-8') as file:
                medicines = json.load(file)
        except FileNotFoundError:
            medicines = []

        # Thêm dữ liệu mới
        medicines.append(data)

        # Ghi lại file JSON
        with open('medicine.json', 'w', encoding='utf-8') as file:
            json.dump(medicines, file, indent=4)
        return redirect(url_for('list_medicines'))
    return render_template('add_medicine.html')

@app.route('/edit_medicine/<int:id>', methods=['GET', 'POST'])
def edit_medicine(id):
    medicine = Medicine.query.get_or_404(id)
    description = ""  # Mặc định để rỗng nếu không tìm thấy trong JSON

    # Đọc description từ file JSON khi tải form
    try:
        with open('medicine.json', 'r', encoding='utf-8') as file:
            medicines = json.load(file)
            for med in medicines:
                if med['name_medicine'] == medicine.name:
                    description = med['description']
                    break
    except FileNotFoundError:
        medicines = []

    if request.method == 'POST':
        # Cập nhật thông tin thuốc
        medicine.name = request.form['name']
        medicine.price = float(request.form['price'])
        medicine.quantity = int(request.form['quantity'])
        medicine.expiry_date = request.form['expiry_date']
        description = request.form['description']
        db.session.commit()

        # Cập nhật thông tin trong file JSON
        updated = False
        for med in medicines:
            if med['name_medicine'] == medicine.name:
                med['description'] = description
                med['price'] = medicine.price
                updated = True
                break
        if not updated:
            medicines.append({"name_medicine": medicine.name, "description": description, "price": medicine.price})

        with open('medicine.json', 'w', encoding='utf-8') as file:
            json.dump(medicines, file, indent=4)
        return redirect(url_for('list_medicines'))

    return render_template('edit_medicine.html', medicine=medicine, description=description)


# Xóa thuốc
@app.route('/delete_medicine/<int:id>', methods=['POST'])
def delete_medicine(id):
    medicine = Medicine.query.get_or_404(id)
    db.session.delete(medicine)
    db.session.commit()
    return redirect(url_for('list_medicines'))

# Thêm khách hàng
@app.route('/add_customer', methods=['GET', 'POST'])
def add_customer():
    if request.method == 'POST':
        name = request.form['name']
        phone = request.form['phone']
        new_customer = Customer(name=name, phone=phone)
        db.session.add(new_customer)
        db.session.commit()
        return redirect(url_for('list_customers'))
    return render_template('add_customer.html')

@app.route('/customers')
def list_customers():
    customers = Customer.query.all()
    return render_template('list_customers.html', customers=customers)

# Thêm hóa đơn
@app.route('/add_invoice', methods=['GET', 'POST'])
def add_invoice():
    customers = Customer.query.all()
    medicines = Medicine.query.all()
    if request.method == 'POST':
        customer_id = int(request.form['customer_id'])
        medicine_id = int(request.form['medicine_id'])
        quantity = int(request.form['quantity'])
        
        # Sử dụng datetime thay vì chuỗi
        issue_date = datetime.now()
        
        new_invoice = Invoice(customer_id=customer_id, medicine_id=medicine_id, quantity=quantity, issue_date=issue_date)
        db.session.add(new_invoice)
        db.session.commit()
        return redirect(url_for('list_invoices'))
    return render_template('add_invoice.html', customers=customers, medicines=medicines)

def calculate_total_amount(invoice):
    medicine = Medicine.query.get(invoice.medicine_id)
    return invoice.quantity * medicine.price

@app.route('/invoices')
def list_invoices():
    all_invoices = Invoice.query.all()
    invoice_details = []

    for invoice in all_invoices:
        customer = Customer.query.get(invoice.customer_id)  
        medicine = Medicine.query.get(invoice.medicine_id)  
        total_amount = calculate_total_amount(invoice)  
        invoice_details.append({
            'id': invoice.id,
            'customer_name': customer.name,  
            'medicine_name': medicine.name,  
            'quantity': invoice.quantity,     
            'total_amount': total_amount,    
            'issue_date': invoice.issue_date.strftime('%d/%m/%Y')  
        })

    return render_template('list_invoices.html', invoices=invoice_details)

@app.route('/revenue')
def revenue():
    # Lấy danh sách hóa đơn
    invoices = Invoice.query.order_by(Invoice.issue_date).all()

    # Tính tổng doanh thu theo ngày
    revenue_by_date = {}
    invoice_details = []
    for invoice in invoices:
        customer = Customer.query.get(invoice.customer_id)  
        medicine = Medicine.query.get(invoice.medicine_id)  
        total_amount = calculate_total_amount(invoice) 
        date = invoice.issue_date.strftime('%d/%m/%Y')

        if date not in revenue_by_date:
            revenue_by_date[date] = 0
        revenue_by_date[date] += total_amount

        # Lưu thông tin vào danh sách
        invoice_details.append({
            'id': invoice.id,
            'customer_name': customer.name,
            'medicine_name': medicine.name,
            'quantity': invoice.quantity,
            'total_amount': total_amount,
            'issue_date': invoice.issue_date.strftime('%d/%m/%Y')
        })

    # Chuyển dữ liệu sang danh sách để sử dụng trong biểu đồ
    dates = list(revenue_by_date.keys())
    revenues = list(revenue_by_date.values())

    return render_template('revenue.html', invoices=invoice_details, total_revenue=sum(revenues), dates=dates, revenues=revenues)

@app.route('/review')
def review():
    try:
        with open('medicine.json', 'r', encoding='utf-8') as file:
            medicines = json.load(file)
        return render_template('description.html',medicines=medicines)
    except FileNotFoundError:
        return render_template('description.html')




if __name__ == '__main__':
    app.run(debug=True)
