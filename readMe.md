# Auth

    mkdir auth
    cd auth
    npm init -y
    npm install typescript ts-node-dev express @types/express express-validator express-async-errors mongoose @types/mongoose cookie-session @types/cookie-session jsonwebtoken @types/jsonwebtoken
    npm install --save-dev @types/jest @types/supertest jest supertest mongodb-memory-server ts-jest
    npm install -g typescript
    tsc --init


    docker build -t ozerdur/auth .
    docker push ozerdur/auth

### Generate env secret

    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
    kubectl get secrets

### ingress-nginx

    if not applied for the cluster
    https://kubernetes.github.io/ingress-nginx/deploy/
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.46.0/deploy/static/provider/cloud/deploy.yaml

    add 127.0.0.1 ticketing.dev to /etc/hosts file

    type thisisunsafe when https certifate error received in browser
