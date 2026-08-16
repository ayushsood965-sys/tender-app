import requests

BASE_URL = "http://localhost:5000/api"

# 1. Superadmin Login
admin_res = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "admin@hpuniv.ac.in",
    "password": "Admin@123"
})
print("Super Admin Login:", admin_res.status_code, admin_res.json().get("user", {}).get("fullName"))
admin_token = admin_res.json().get("token")

# 2. Register New User
user_res = requests.post(f"{BASE_URL}/auth/register", json={
    "fullName": "Dr. Rohit Sharma",
    "email": "rohit.physics@hpuniv.ac.in",
    "departmentName": "Department of Physics",
    "phone": "9816123456",
    "designation": "Assistant Professor",
    "dob": "1990-05-15",
    "password": "Password@123",
    "confirmPassword": "Password@123"
})
print("User Registration:", user_res.status_code, user_res.json().get("user", {}).get("fullName"))
user_token = user_res.json().get("token")

# 3. Create Custom Term as User
term_res = requests.post(f"{BASE_URL}/terms", json={
    "categoryId": 1,
    "title": "Special Physics Calibration Requirement",
    "description": "Equipment must be calibrated at NABL accredited facility."
}, headers={"Authorization": f"Bearer {user_token}"})
print("User Created Custom Term:", term_res.status_code, term_res.json().get("title"))
custom_term_id = term_res.json().get("id")

# 4. User attempts to delete Master Term (ID 1) -> Should fail with 403
del_master_res = requests.delete(f"{BASE_URL}/terms/1", headers={"Authorization": f"Bearer {user_token}"})
print("User Attempt to Delete Master Term (Expect 403):", del_master_res.status_code, del_master_res.json().get("error"))

# 5. User deletes own Custom Term -> Should succeed with 200
del_own_res = requests.delete(f"{BASE_URL}/terms/{custom_term_id}", headers={"Authorization": f"Bearer {user_token}"})
print("User Delete Own Custom Term (Expect 200):", del_own_res.status_code, del_own_res.json().get("message"))

# 6. Super Admin List Users
users_list_res = requests.get(f"{BASE_URL}/auth/users", headers={"Authorization": f"Bearer {admin_token}"})
print("Superadmin Users List (Expect 200):", users_list_res.status_code, f"Total Users: {len(users_list_res.json())}")
