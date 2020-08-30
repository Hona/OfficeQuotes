# Stop and remove existing production container
echo '-= Stopping Production Container =-'
docker container stop officequotes-production

echo '-= Removing Old Production Container =-'
docker container rm officequotes-production

# Build the image with the name 'tempus-hub'
echo '-= Building Docker Image from Dockerfile =-\n'
docker build -t officequotes ./src/OfficeQuotesBlazor/

echo '-= Runnning the Image =-\n'
docker run --restart always --name "officequotes-production" -d -p 10000:5001 officequotes
