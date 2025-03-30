run:
	./start.sh

cert:
	./gen-cert.sh

install:
	python3 -m venv venv && bash -c "source venv/bin/activate && pip install -r requirements.txt"
