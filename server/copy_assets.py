import os
import shutil

os.makedirs("assets", exist_ok=True)
shutil.copy("extracted_image1.png", "assets/hpu_logo.png")
shutil.copy("extracted_image2.png", "assets/hpu_watermark.png")

# Also copy to client/public
os.makedirs("../client/public", exist_ok=True)
shutil.copy("extracted_image1.png", "../client/public/hpu_logo.png")
shutil.copy("extracted_image2.png", "../client/public/hpu_watermark.png")

print("Copied hpu_logo.png and hpu_watermark.png to server/assets and client/public!")
