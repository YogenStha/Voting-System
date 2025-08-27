import os
import django
from PIL import Image
import base64 

# ✅ Setup Django environment first
# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # adjust if your settings file is elsewhere
# django.setup()

# Now you can safely import your models
# from chunabE.models import Candidate
# from django.conf import settings

# def check_candidate_images():
#     candidates = Candidate.objects.all()
#     for candidate in candidates:
#         if not candidate.image:
#             print(f"[MISSING] Candidate {candidate.name} has no image set.")
#             continue

#         image_path = os.path.join(settings.MEDIA_ROOT, candidate.image.name)
#         if not os.path.exists(image_path):
#             print(f"[NOT FOUND] Candidate {candidate.name}: {image_path}")
#             continue

#         try:
#             with Image.open(image_path) as img:
#                 img.verify()
#             print(f"[OK] Candidate {candidate.name}: {image_path} ✅")
#         except Exception as e:
#             print(f"[CORRUPT] Candidate {candidate.name}: {image_path} ❌ ({e})")
            
def decrypt():
    s_base = "kg5xXaTAdFh5Eul37cLNdNNyOvf0NBnsO4GutKqf3XA="
    s = base64.b64decode(s_base)
    s_n = list(s)
    print(s_n)
    
   

# if __name__ == "__main__":
#     check_candidate_images()
decrypt()

