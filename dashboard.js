import { register, Counter } from 'prom-client';
import { users } from './config/mongoCollections.js';
import AWS from 'aws-sdk';

const cloudwatch = new AWS.CloudWatch({
    region: 'us-east-1',
});

const operationCounter = new Counter({ 
    name: 'app_operations_total',
    help: 'Total number of operations performed'
});

function pushMetrics(metricName, value) {
    const params = {
        MetricData: [
            {
            MetricName: metricName,
            Dimensions: [
                {
                Name: 'InstanceId',
                Value: 'i-048d39acec13b205f',
                },
            ],
            Unit: 'Count',
            Value: value,
            },
        ],
        Namespace: 'CustomAppMetrics',
    };
  
    cloudwatch.putMetricData(params, (err, data) => {
      if (err) console.error('Error pushing metrics:', err);
      else console.log('Metrics pushed successfully:', data);
    });
}

//Pushes the metrics every minute
setInterval(async () => {
    const operationsCount = (await operationCounter.get()).values[0]?.value || 0;
    pushMetrics("AppOperations", operationsCount);

    const userCollection = await users();
    const allUsers = await userCollection.find({}).toArray();
    const numUsers = allUsers.length;
    pushMetrics("AppUsers", numUsers);
}, 5000);

export default operationCounter;