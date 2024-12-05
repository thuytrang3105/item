from app import app  
from extensions import db
from models import User
from werkzeug.security import generate_password_hash

# Sử dụng application context
with app.app_context():
    # Khởi tạo cơ sở dữ liệu nếu chưa có
    db.create_all()

    # Tạo người dùng quản lý
    manager = User(username='admin', password=generate_password_hash('admin123', method='pbkdf2:sha256'), role='manager')
    employee = User(username='staff', password=generate_password_hash('staff123', method='pbkdf2:sha256'), role='employee')


    # Lưu vào cơ sở dữ liệu
    db.session.add(manager)
    db.session.add(employee)
    db.session.commit()
    print("Người dùng đã được tạo thành công!")
