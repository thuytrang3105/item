# app.py
from flask import Flask, render_template, request, redirect, url_for
from extensions import db  # Import db từ extensions.py
from models import Medicine, Customer, Invoice
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharmacy.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Liên kết SQLAlchemy với Flask app
db.init_app(app)

# Tạo các bảng cơ sở dữ liệu nếu chưa có
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('home.html')

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
        new_medicine = Medicine(name=name, price=price, quantity=quantity, expiry_date=expiry_date)
        db.session.add(new_medicine)
        db.session.commit()
        return redirect(url_for('list_medicines'))
    return render_template('add_medicine.html')
#sửa thuốc
@app.route('/edit_medicine/<int:id>', methods=['GET', 'POST'])
def edit_medicine(id):
    medicine = Medicine.query.get_or_404(id)
    if request.method == 'POST':
        medicine.name = request.form['name']
        medicine.price = float(request.form['price'])
        medicine.quantity = int(request.form['quantity'])
        medicine.expiry_date = request.form['expiry_date']
        db.session.commit()
        return redirect(url_for('list_medicines'))
    return render_template('edit_medicine.html', medicine=medicine)

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
        issue_date = datetime.now().strftime('%Y-%m-%d')
        
        new_invoice = Invoice(customer_id=customer_id, medicine_id=medicine_id, quantity=quantity, issue_date=issue_date)
        db.session.add(new_invoice)
        db.session.commit()
        return redirect(url_for('list_invoices'))
    return render_template('add_invoice.html', customers=customers, medicines=medicines)

@app.route('/invoices')
def list_invoices():
    invoices = Invoice.query.all()
    return render_template('list_invoices.html', invoices=invoices)

if __name__ == '__main__':
    app.run(debug=True)
