FROM node:18-slim

ENV PNPM_HOME="/pnpm"

ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml tsconfig.json ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

COPY ./src ./src

VOLUME /app/data

EXPOSE 24932

RUN ls

RUN ls node_modules

RUN ls node_modules/ts-node

CMD [ "pnpm", "dev" ]