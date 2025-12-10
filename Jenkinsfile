pipeline {
    agent {
        kubernetes {
            yaml '''
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: node
                    image: node:20-alpine
                    command:
                    - cat
                    tty: true
                    resources:
                      requests:
                        memory: "1Gi"
                        cpu: "500m"
                      limits:
                        memory: "2Gi"
                        cpu: "1000m"
                  - name: docker
                    image: docker:24-dind
                    securityContext:
                      privileged: true
                    env:
                    - name: DOCKER_TLS_CERTDIR
                      value: ""
                    resources:
                      requests:
                        memory: "512Mi"
                        cpu: "200m"
                      limits:
                        memory: "1Gi"
                        cpu: "500m"
                  - name: kubectl
                    image: alpine/k8s:1.28.3
                    command: [cat]
                    tty: true
            '''
        }
    }
    
    environment {
        REGISTRY_URL = 'registry.gitlab.com'
        REGISTRY_PATH = 'jssrinfotech/admin-casino-frontend'
        IMAGE_NAME = 'admin-casino'
        API_URL = 'https://admin.api.goodluck24bet.com'
        K8S_NAMESPACE = 'luck-casino-prod'
        K8S_DEPLOYMENT = 'admin-casino-frontend'
        CONTAINER_NAME = 'admin-frontend'
        CI = 'false'
    }
    
    options {
        timeout(time: 30, unit: 'MINUTES')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Source code already checked out by Jenkins'
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "prod-${new Date().format('yyyyMMdd-HHmm')}-${env.GIT_COMMIT_SHORT}"
                    env.FULL_IMAGE_NAME = "${env.REGISTRY_URL}/${env.REGISTRY_PATH}/${env.IMAGE_NAME}"
                    echo """
                    ================================
                    🎨 Frontend Deployment Pipeline
                    ================================
                    Deployment: ${env.K8S_DEPLOYMENT}
                    Namespace: ${env.K8S_NAMESPACE}
                    Container: ${env.CONTAINER_NAME}
                    
                    📦 Image Details:
                    • Versioned: ${env.FULL_IMAGE_NAME}:${env.BUILD_TAG}
                    • Latest: ${env.FULL_IMAGE_NAME}:latest
                    
                    🔗 API URL: ${env.API_URL}
                    📝 Git Commit: ${env.GIT_COMMIT_SHORT}
                    🏗️  Build Number: ${BUILD_NUMBER}
                    ================================
                    """
                }
            }
        }
        
        stage('Build React App') {
            steps {
                container('node') {
                    echo '⚛️  Building React application...'
                    sh '''
                        echo "Node.js version: $(node --version)"
                        echo "npm version: $(npm --version)"
                        
                        export NODE_OPTIONS="--max-old-space-size=1536"
                        export CI=false
                        
                        echo "📦 Installing dependencies..."
                        if npm ci --prefer-offline --no-audit; then
                            echo "✅ npm ci completed successfully"
                        else
                            echo "⚠️  npm ci failed, using npm install as fallback..."
                            rm -f package-lock.json
                            npm install --prefer-offline --no-audit
                            echo "✅ npm install completed successfully"
                        fi
                        
                        echo "🔧 Creating environment file..."
                        cat > .env.production << EOF
REACT_APP_API_URL=${API_URL}
REACT_APP_ENV=production
EOF
                        
                        echo "📋 Environment configuration:"
                        cat .env.production
                        
                        echo "🏗️  Building React application..."
                        npm run build
                        
                        echo "✅ Build completed successfully!"
                        echo "📊 Build size: $(du -sh build/)"
                    '''
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                container('docker') {
                    echo '🐳 Building Docker image...'
                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-jssr-infotech',
                        usernameVariable: 'REGISTRY_USER',
                        passwordVariable: 'REGISTRY_PASS'
                    )]) {
                        sh '''
                            echo "⏳ Waiting for Docker daemon..."
                            timeout 60 sh -c 'until docker info > /dev/null 2>&1; do sleep 2; done'
                            echo "✅ Docker daemon ready"
                            
                            echo "🔐 Logging into GitLab registry..."
                            echo "$REGISTRY_PASS" | docker login $REGISTRY_URL -u "$REGISTRY_USER" --password-stdin
                            
                            echo "🏗️  Building Docker image with versioned tag..."
                            docker build -t ${FULL_IMAGE_NAME}:${BUILD_TAG} .
                            
                            echo "🏷️  Tagging image as latest..."
                            docker tag ${FULL_IMAGE_NAME}:${BUILD_TAG} ${FULL_IMAGE_NAME}:latest
                            
                            echo "✅ Image built and tagged successfully"
                        '''
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                container('docker') {
                    echo '📤 Pushing Docker images to registry...'
                    sh '''
                        echo "📤 Pushing versioned tag..."
                        docker push ${FULL_IMAGE_NAME}:${BUILD_TAG}
                        echo "✅ Versioned tag pushed"
                        
                        echo "📤 Pushing latest tag..."
                        docker push ${FULL_IMAGE_NAME}:latest
                        echo "✅ Latest tag pushed"
                        
                        echo "✅ Both images are now available in GitLab registry!"
                    '''
                }
            }
        }
        
        stage('Deploy to K8s') {
            steps {
                container('kubectl') {
                    withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KUBECONFIG')]) {
                        sh '''
                            echo "🔧 Configuring kubectl..."
                            chmod 600 $KUBECONFIG
                            
                            echo "🚀 Updating deployment..."
                            kubectl set image deployment/${K8S_DEPLOYMENT} \
                                ${CONTAINER_NAME}=${FULL_IMAGE_NAME}:${BUILD_TAG} \
                                -n ${K8S_NAMESPACE}
                            
                            echo "⏳ Waiting for rollout to complete..."
                            kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                                -n ${K8S_NAMESPACE} \
                                --timeout=5m
                            
                            echo "✅ Deployment successful!"
                            
                            echo ""
                            echo "📊 Current deployment status:"
                            kubectl get deployment ${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE}
                            
                            echo ""
                            echo "🔍 Running pods:"
                            kubectl get pods -n ${K8S_NAMESPACE} -l app=admin-casino-frontend
                        '''
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                try {
                    container('docker') {
                        echo '🧹 Cleaning up Docker images...'
                        sh '''
                            if docker info > /dev/null 2>&1; then
                                docker rmi ${FULL_IMAGE_NAME}:${BUILD_TAG} || true
                                docker rmi ${FULL_IMAGE_NAME}:latest || true
                                docker image prune -f || true
                                echo "✅ Cleanup completed"
                            fi
                        '''
                    }
                } catch (Exception e) {
                    echo "Cleanup skipped: ${e.getMessage()}"
                }
            }
        }
        success {
            echo """
            ========================================
            ✅ FRONTEND DEPLOYMENT SUCCESSFUL!
            ========================================
            Build Number: ${BUILD_NUMBER}
            Git Commit: ${env.GIT_COMMIT_SHORT}
            
            🏷️  Images:
            • ${env.FULL_IMAGE_NAME}:${env.BUILD_TAG}
            • ${env.FULL_IMAGE_NAME}:latest
            
            🎯 Deployed to: ${env.K8S_NAMESPACE}
            📦 Deployment: ${env.K8S_DEPLOYMENT}
            
            🌐 Frontend URL: https://admin.goodluck24bet.com
            🔗 API URL: ${env.API_URL}
            ========================================
            """
        }
        failure {
            echo """
            ========================================
            ❌ FRONTEND DEPLOYMENT FAILED!
            ========================================
            Build Number: ${BUILD_NUMBER}
            Git Commit: ${env.GIT_COMMIT_SHORT ?: 'Unknown'}
            
            Check the console output above for details.
            ========================================
            """
        }
    }
}
