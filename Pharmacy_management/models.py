from extensions import db
from datetime import datetime
from flask_login import UserMixin

# Bảng lưu thông tin thuốc
class Medicine(db.Model):
    __tablename__ = 'medicines'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Tên thuốc
    price = db.Column(db.Float, nullable=False)  # Giá thuốc
    quantity = db.Column(db.Integer, nullable=False)  # Số lượng tồn kho
    expiry_date = db.Column(db.String(50), nullable=True)  # Ngày hết hạn

    # Quan hệ: Một loại thuốc có thể nằm trong nhiều hóa đơn
    invoices = db.relationship('Invoice', back_populates='medicine')  # Quan hệ ngược với bảng hóa đơn

# Bảng lưu thông tin khách hàng
class Customer(db.Model):
    __tablename__ = 'customers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Tên khách hàng
    phone = db.Column(db.String(20), nullable=False)  # Số điện thoại

    # Quan hệ: Một khách hàng có thể có nhiều hóa đơn
    invoices = db.relationship('Invoice', back_populates='customer')  # Quan hệ ngược với bảng hóa đơn

# Bảng lưu thông tin hóa đơn
class Invoice(db.Model):
    __tablename__ = 'invoices'
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)  # Khóa ngoại tới khách hàng
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)  # Khóa ngoại tới thuốc
    quantity = db.Column(db.Integer, nullable=False)  # Số lượng mua
    issue_date = db.Column(db.DateTime, default=datetime.utcnow)  # Ngày tạo hóa đơn

    # Quan hệ: Kết nối với bảng Customer và Medicine
    customer = db.relationship('Customer', back_populates='invoices')  # Khách hàng liên quan
    medicine = db.relationship('Medicine', back_populates='invoices')  # Thuốc liên quan

#Bảng lưu thông tin người dùng 
class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), nullable=False) 
