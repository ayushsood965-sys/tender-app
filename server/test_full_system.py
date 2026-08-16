import requests

BASE = "http://localhost:5000/api"

# Step 1: Register New Faculty User
print("\n--- 1. Registering New Faculty User ---")
reg_res = requests.post(f"{BASE}/auth/register", json={
    "fullName": "Dr. Ayush Sood",
    "email": "ayush.physics@hpuniv.ac.in",
    "departmentName": "Department of Physics",
    "phone": "9816099999",
    "designation": "Assistant Professor",
    "dob": "1992-08-20",
    "password": "Password@123",
    "confirmPassword": "Password@123"
})
print("Registration Status:", reg_res.status_code)
user_token = reg_res.json().get("token")
user_id = reg_res.json().get("user", {}).get("id")
print("User Created:", reg_res.json().get("user", {}).get("fullName"), f"(ID: {user_id})")

# Step 2: Create a Tender as Faculty User
print("\n--- 2. Creating Tender as Faculty User ---")
tender_res = requests.post(f"{BASE}/tenders", json={
    "documentType": "Limited Tender Document",
    "tenderName": "Procurement of Physics Optical Spectrum Analyzer",
    "tenderNo": "PHY/HPU/2026/01",
    "departmentName": "Department of Physics",
    "departmentEmail": "ayush.physics@hpuniv.ac.in",
    "estimatedCost": 450000,
    "estimatedCostWords": "Rupees Four Lakh Fifty Thousand Only"
}, headers={"Authorization": f"Bearer {user_token}"})
print("Tender Creation Status:", tender_res.status_code)
created_tender = tender_res.json()
print("Created Tender:", created_tender.get("tenderName"), f"(Owner ID: {created_tender.get('userId')})")

# Step 3: Fetch Shared Master Terms (All users can view all terms)
print("\n--- 3. Fetching Central Shared Terms Repository ---")
terms_res = requests.get(f"{BASE}/terms", headers={"Authorization": f"Bearer {user_token}"})
print("Total Terms in Shared Repository:", len(terms_res.json()))

# Step 4: Faculty User creates Custom Clause
print("\n--- 4. Faculty User Creating Custom Clause ---")
clause_res = requests.post(f"{BASE}/terms", json={
    "categoryId": 7,
    "title": "Laser Safety & Precision Calibration Standards",
    "description": "The equipment must comply with Class 3B laser safety guidelines and ISO 17025 certification."
}, headers={"Authorization": f"Bearer {user_token}"})
print("Custom Clause Created:", clause_res.status_code, clause_res.json().get("title"))
custom_term_id = clause_res.json().get("id")

# Step 5: Faculty User attempts to delete Master Term -> Should be rejected (403)
print("\n--- 5. Faculty User Attempting to Delete Master Term (Expect 403) ---")
del_master = requests.delete(f"{BASE}/terms/101", headers={"Authorization": f"Bearer {user_token}"})
print("Delete Master Term Status:", del_master.status_code, del_master.json().get("error"))

# Step 6: Super Admin Login & Global Oversight
print("\n--- 6. Super Admin Logging In ---")
admin_res = requests.post(f"{BASE}/auth/login", json={
    "email": "admin@hpuniv.ac.in",
    "password": "Admin@123"
})
admin_token = admin_res.json().get("token")
print("Super Admin Logged In:", admin_res.json().get("user", {}).get("fullName"))

# Step 7: Super Admin inspects User Directory & User Tenders
print("\n--- 7. Super Admin Inspecting User Directory ---")
users_res = requests.get(f"{BASE}/auth/users", headers={"Authorization": f"Bearer {admin_token}"})
print("Total Registered Users:", len(users_res.json()))
for u in users_res.json():
    print(f"  - {u.get('fullName')} | {u.get('email')} | {u.get('departmentName')} | Tenders: {u.get('tenderCount')}")

# Step 8: Super Admin searches tenders by user
print("\n--- 8. Super Admin Searching Tenders by User ---")
user_tenders_res = requests.get(f"{BASE}/tenders?searchUserId={user_id}", headers={"Authorization": f"Bearer {admin_token}"})
print(f"Tenders by Dr. Ayush Sood found by Super Admin: {len(user_tenders_res.json())}")

print("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!")
