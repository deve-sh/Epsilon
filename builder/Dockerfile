# Steps:
#
# 1. Clone/copy the user's repository onto the VM
# 2. Copy this and build.sh file into the folder
# 3. Dynamically update the CMD of this file
# 4. Dynamically update the build.sh file to give a unique tag to this container/image
# 5. Run build.sh and get the new docker image for the function ready
# 6. Upload this Dockerfile to AWS ECR / Dockerhub or any other docker service
# 7. Pull the image onto a VM and run its container \
#    with a dynamic port on the VM to expose the cloud function to the world \
#    via the VM's networking

FROM node:18

WORKDIR /app

ENV RUNNING_IN_VM Y

COPY . .

# Install user repository dependencies
RUN npm install

# Install Epsilon runner
RUN npm i -g epsilon-runner

EXPOSE 8080

# Update this command dynamically at build time
CMD npx epsilon-runner build __/app/test__ __testFunction__

# Update such as:
# fs.readFileSync('Dockerfile', 'utf-8')
#   .replace('/app/test', `/app/${functionsExportFilePath}`)
#   .replace('__testFunction__', functionName)