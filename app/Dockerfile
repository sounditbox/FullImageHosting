FROM python:3.12-alpine

WORKDIR /app

RUN mkdir logs backups images static

COPY requirements.txt .
RUN pip install -r requirements.txt


COPY . .

EXPOSE 8000

CMD ["python", "app.py"]