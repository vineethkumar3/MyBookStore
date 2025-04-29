FROM python:3.9

WORKDIR ./

COPY ./ ./

RUN pip install -r requirements.txt

CMD ["python3", "app.py"]