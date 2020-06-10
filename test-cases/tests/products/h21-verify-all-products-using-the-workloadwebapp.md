---
estimate: 30m
---

# H21 - Verify all products using the workload-web-app

## Description

The [workload-web-app](https://github.com/integr8ly/workload-web-app) will:

- Create a small AMQ Queue and verify that it can send and receive messages
- Create a user in the User SSO and verify that it can login to it
- Create a 3scale API and verify that it respond

## Steps

1. Clone the [workload-web-app](https://github.com/integr8ly/workload-web-app) repository

2. Login to the cluster as **kubeadmin**

3. Deploy the **workload-web-app** to the cluster

   ```bash
    make local/deploy
   ```

   > Verify tha the AMQ_QUEUE, RHSSO_SERVER_URL and THREE_SCALE_URL have been created during the deployment
   >
   > ```
   > Deploying the webapp with the following parameters:
   > AMQ_ADDRESS=amqps://...
   > AMQ_QUEUE=/...
   > RHSSO_SERVER_URL=https://...
   > THREE_SCALE_URL=https://...
   > ```

4. Open the RHMI Grafana Console in the `redhat-rhmi-middleware-monitoring-operator` namespace

   ```bash
   echo "https://$(oc get route grafana-route -n redhat-rhmi-middleware-monitoring-operator -o=jsonpath='{.spec.host}')"
   ```

5. Select the **Workload App** dashboard

   > Verify that **AMQ**, **3scale** and **SSO** are working by checking the **Status** graph
   >
   > Note: it's normal that graph will show a short downtime at the start for 3scale and/or AMQ because the workload-web-app is usually deployed before the 3scale API and/or the AMQ queue is ready