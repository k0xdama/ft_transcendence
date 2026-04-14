FROM postgres:18-alpine

COPY entrypoint-wrapper.sh /usr/local/bin/entrypoint-wrapper.sh

RUN chmod +x /usr/local/bin/entrypoint-wrapper.sh

ENTRYPOINT [ "/usr/local/bin/entrypoint-wrapper.sh" ]

CMD [ "postgres" ]
