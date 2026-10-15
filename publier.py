#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
publier.py - Met en ligne les dernières versions des ateliers sur GitHub Pages.

Utilisation (dans ce dossier), après un « py -3 build.py » dans le dossier d'un atelier :
    py -3 publier.py

Le script copie les pages en_ligne/index.html des ateliers dans ce dossier, puis les envoie sur GitHub.
Le site se met à jour en une à deux minutes, aux mêmes adresses :
    https://belelhanachi-hub.github.io/ateliers-bf-conseil/sourcing/
    https://belelhanachi-hub.github.io/ateliers-bf-conseil/pac-ntc/
    https://belelhanachi-hub.github.io/ateliers-bf-conseil/mission-berthier/
    https://belelhanachi-hub.github.io/ateliers-bf-conseil/facturation/

Seules les pages des étudiants sont publiées : jamais les codes, config.ini ou les corrigés formateur.
La facturation en ligne ne contient aucune donnée (elles sont dans le Google Drive BF Conseil).
"""
import os
import shutil
import subprocess
import sys
from datetime import datetime

ICI = os.path.dirname(os.path.abspath(__file__))
PAGES = {
    "sourcing": os.path.join(ICI, "..", "ateliers-sourcing-rh", "en_ligne", "index.html"),
    "pac-ntc": os.path.join(ICI, "..", "atelier-pac-ntc", "en_ligne", "index.html"),
    "mission-berthier": os.path.join(ICI, "..", "mission-berthier", "en_ligne", "index.html"),
    "etude-de-marche-ma28": os.path.join(ICI, "..", "ma28-etude-de-marche", "en_ligne", "index.html"),
    "fiches-ntc-foot": os.path.join(ICI, "..", "fiches-actions-ntc", "variantes", "foot", "en_ligne", "index.html"),
    "fiches-ntc-carrelage": os.path.join(ICI, "..", "fiches-actions-ntc", "variantes", "carrelage", "en_ligne", "index.html"),
    "facturation": os.path.join(ICI, "..", "facturation-bf-conseil", "en_ligne", "index.html"),
}
# fichiers en plus de index.html (icônes de l'écran d'accueil du téléphone)
AUTRES = {"facturation": ["manifest.webmanifest", "icone-180.png", "icone-192.png", "icone-512.png"]}


def git(*args):
    return subprocess.run(["git", *args], cwd=ICI, text=True, capture_output=True)


def main():
    for dossier, source in PAGES.items():
        if not os.path.exists(source):
            sys.exit("ERREUR : %s introuvable. Lance d'abord py -3 build.py dans le dossier de l'atelier." % source)
        os.makedirs(os.path.join(ICI, dossier), exist_ok=True)
        shutil.copyfile(source, os.path.join(ICI, dossier, "index.html"))
        for nom in AUTRES.get(dossier, []):
            shutil.copyfile(os.path.join(os.path.dirname(source), nom), os.path.join(ICI, dossier, nom))
    git("add", "-A")
    if not git("status", "--porcelain").stdout.strip():
        print("Rien de nouveau : le site est déjà à jour.")
        return
    git("commit", "-m", "Mise à jour des ateliers du %s" % datetime.now().strftime("%d/%m/%Y à %Hh%M"))
    envoi = git("push")
    if envoi.returncode != 0:
        sys.exit("ERREUR pendant l'envoi sur GitHub :\n" + envoi.stderr)
    print("Envoyé. Le site sera à jour dans une à deux minutes.")
    for dossier in PAGES:
        print("  https://belelhanachi-hub.github.io/ateliers-bf-conseil/%s/" % dossier)


if __name__ == "__main__":
    main()
