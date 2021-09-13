FROM python:3.9.7-slim-buster

WORKDIR /jsonify
COPY . /jsonify

RUN pip install -r requirements.txt  && \
    useradd --system flask           && \
    chown -R flask:flask .

USER flask
ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["python3", "run.py"]
