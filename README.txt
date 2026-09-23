CD-Katalog — Progressive Web App
=================================

Das ist eine komplett eigenständige Website (kein Claude, keine externen
Abhängigkeiten). Damit sie als "App" mit eigenem Icon aufs iPhone kommt,
muss sie irgendwo im Web liegen (iOS installiert Home-Bildschirm-Apps nur
von echten https-URLs, nicht von lokalen Dateien).

Alle Daten (Bewertungen, verliehene CDs, neue CDs, Wunschliste) werden
NUR lokal auf dem jeweiligen Gerät gespeichert (localStorage des Browsers).
Es gibt keinen Server, keine Synchronisierung zwischen Geräten mehr — das
ist der Tradeoff für "komplett offline, kein Claude".


OPTION A — GitHub Pages (empfohlen, dauerhaft, kostenlos)
-----------------------------------------------------------
1. Auf github.com ein neues, öffentliches Repository anlegen, z.B. "cd-katalog".
2. Alle Dateien aus diesem Ordner in das Repository hochladen (per Weboberfläche:
   "Add file" -> "Upload files", oder per git push).
3. Im Repository: Settings -> Pages -> unter "Build and deployment" die Branch
   auf "main" und den Ordner auf "/ (root)" stellen -> Save.
4. Nach ca. 1 Minute ist die Seite unter https://DEIN-NUTZERNAME.github.io/cd-katalog/
   erreichbar.
5. Diesen Link auf dem iPhone in Safari öffnen -> Teilen-Symbol -> "Zum
   Home-Bildschirm" -> Hinzufügen.

Wenn sich später die CD-Sammlung ändert (neue Excel-Daten), schicke mir
Bescheid — ich baue dir eine aktualisierte index.html, die du einfach über
die alte im selben Repository hochlädst (überschreiben). Die App auf dem
Handy holt sich die neue Version automatisch beim nächsten Online-Start.


OPTION B — Netlify Drop (kein Account nötig, in 30 Sekunden live)
--------------------------------------------------------------------
1. Im Browser auf https://app.netlify.com/drop gehen.
2. Diesen ganzen Ordner (nicht die ZIP-Datei, sondern den entpackten Ordner)
   per Drag & Drop auf die Seite ziehen.
3. Netlify vergibt sofort eine URL wie https://irgendwas-1234.netlify.app/.
4. Diesen Link auf dem iPhone in Safari öffnen -> Teilen-Symbol -> "Zum
   Home-Bildschirm" -> Hinzufügen.

Nachteil: Ohne (kostenlosen) Netlify-Account lässt sich diese Seite später
nicht mehr aktualisieren, nur komplett neu droppen (neue URL, App müsste neu
hinzugefügt werden). Für "einmal einrichten, nie wieder anfassen" reicht das.


Danach
------
Icon vom Home-Bildschirm öffnen -> läuft im Vollbild wie eine echte App,
funktioniert nach dem ersten Laden komplett ohne Internet, Drucken und
Sticker-Export funktionieren jetzt direkt (kein Umweg mehr nötig), weil die
Seite in echtem Safari läuft statt in der Claude-App.
