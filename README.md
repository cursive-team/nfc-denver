# nfc-denver

Repo hosting the code for the ETHDenver 2024 NFC activation.

## Setup

This repo uses Next.js for client and server code. It uses npm to manage dependencies. You will also need to set up a Postgres database, using the `.env.example` as reference.

## Notes

- Right now, registration needs to include a mock `cmac`
  - cmac must be between 0 and 49 inclusive to be a PERSON
  - cmac must be between 50 and 99 inclusive to be a LOCATION
  - `/register?cmac=2`
