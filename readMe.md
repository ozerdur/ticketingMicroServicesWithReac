### Generate env secret

    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdf
    kubectl get secrets

### ingress-nginx

    if not applied for the cluster
    https://kubernetes.github.io/ingress-nginx/deploy/
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.46.0/deploy/static/provider/cloud/deploy.yaml

    add 127.0.0.1 ticketing.dev to /etc/hosts file

    type thisisunsafe when https certifate error received in browser

    to access nginx from pod find domain with <service>.<namespace>.svc.cluster.local
    to list namespaces
        kubectl get namespaces
    to list services inside a namespace
        kubectl get services -n <namespace>

# Auth

    mkdir auth
    cd auth
    npm init -y
    npm install typescript ts-node-dev express @types/express express-validator express-async-errors mongoose @types/mongoose cookie-session @types/cookie-session jsonwebtoken @types/jsonwebtoken
    npm install --save-dev @types/jest @types/supertest jest supertest mongodb-memory-server ts-jest
    npm install -g typescript
    tsc --init

    after common library
        npm install @ozerdurtickets/common


    docker build -t ozerdur/auth .
    docker push ozerdur/auth

# Client

    mkdir client
    cd client
    npm init -y
    npm install react react-dom next
    npm install bootstrap
    npm install axios


    docker build -t ozerdur/ticketing_client .
    docker push ozerdur/ticketing_client

# Common

    npm init
    npm i express express-validator cookie-session jsonwebtoken @types/cookie-session @types/express @types/jsonwebtoken
    git add . && git commit -m "initial commit"
    npm publish --access public

    to update npm package
        git add . && git commit -m "additional config"
        npm version patch  //updates package.json version
        npm run build
        npm publish

    tsc --init
    npm install typescript del-cli --save-dev
