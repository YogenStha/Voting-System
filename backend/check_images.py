import os
import django
from PIL import Image

# ✅ Setup Django environment first
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")  # adjust if your settings file is elsewhere
django.setup()

# Now you can safely import your models
from chunabE.models import Candidate
from django.conf import settings

def check_candidate_images():
    candidates = Candidate.objects.all()
    for candidate in candidates:
        if not candidate.image:
            print(f"[MISSING] Candidate {candidate.name} has no image set.")
            continue

        image_path = os.path.join(settings.MEDIA_ROOT, candidate.image.name)
        if not os.path.exists(image_path):
            print(f"[NOT FOUND] Candidate {candidate.name}: {image_path}")
            continue

        try:
            with Image.open(image_path) as img:
                img.verify()
            print(f"[OK] Candidate {candidate.name}: {image_path} ✅")
        except Exception as e:
            print(f"[CORRUPT] Candidate {candidate.name}: {image_path} ❌ ({e})")

if __name__ == "__main__":
    check_candidate_images()
