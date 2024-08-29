Installation manual steps:

brew install kind

kind create cluster

kubectl cluster-info --context kind-kind


helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm install prometheus prometheus-community/prometheus

kubectl expose service prometheus-server --type=NodePort --target-port=9090 --name=prometheus-server-ext

kubectl port-forward prometheus-server-5cb4df74b6-cw5wr 9090:9090 &



helm repo add grafana https://grafana.github.io/helm-charts

helm repo update

helm install grafana grafana/grafana

kubectl expose service grafana --type=NodePort --target-port=3000 --name=grafana-ext

kubectl port-forward grafana-5df7448485-cgr27 3000:3000 &


#get pass of grafana
kubectl get secret grafana -o jsonpath="{.data.admin-password}" | base64 --decode; echo




kubectl expose service prometheus-kube-state-metrics-75b5bb4bf8-x8gfq --type=NodePort --target-port=8080 --name=prometheus-kube-state-metrics-ext


kubectl port-forward prometheus-kube-state-metrics-75b5bb4bf8-x8gfq 8080:8080 &


Grafana query:
