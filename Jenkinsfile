pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    triggers {
        // Revisa GitHub cada 5 minutos; si hay commits nuevos, dispara el pipeline
        pollSCM('H/5 * * * *')
    }

    environment {
        APP_DIR    = 'backend'
        APP_NAME   = 'blade-backend'
        PORT       = '3000'
        // host.docker.internal resuelve al host Windows desde el contenedor Jenkins
        DEPLOY_URL = 'http://host.docker.internal:3001/deploy'
    }

    stages {

        // ── 1. Checkout ─────────────────────────────────────────────────────
        stage('Clonar código') {
            steps {
                echo '📥 Código clonado desde GitHub ✅'
                sh 'git log -1 --pretty=format:"  Commit : %h%n  Mensaje: %s%n  Autor  : %an"'
            }
        }

        // ── 2. Dependencias ─────────────────────────────────────────────────
        stage('Instalar dependencias') {
            steps {
                dir("${APP_DIR}") {
                    sh '''
                        echo "Node: $(node --version)  NPM: $(npm --version)"
                        npm install --prefer-offline
                        echo "📦 Dependencias instaladas ✅"
                    '''
                }
            }
        }

        // ── 3. Tests ────────────────────────────────────────────────────────
        stage('Correr tests') {
            steps {
                dir("${APP_DIR}") {
                    sh 'npm test'
                }
            }
        }

        // ── 4. Deploy → host via webhook ─────────────────────────────────────
        // El token se lee de /var/jenkins_home/.blade_deploy_token (no está en source code).
        // Si el archivo no existe, el stage falla con mensaje claro.
        stage('Despliegue (host via webhook)') {
            steps {
                sh '''
                    TOKEN_FILE="/var/jenkins_home/.blade_deploy_token"
                    if [ ! -f "$TOKEN_FILE" ]; then
                        echo "❌ Token file no encontrado: $TOKEN_FILE"
                        echo "   Ejecuta: docker exec jenkins bash -c \"echo -n TU_TOKEN > $TOKEN_FILE && chmod 600 $TOKEN_FILE\""
                        exit 1
                    fi

                    DEPLOY_TOKEN=$(cat "$TOKEN_FILE")
                    echo "🚀 Enviando señal de deploy al host..."

                    HTTP=$(curl -s -o /tmp/resp.txt -w "%{http_code}" \
                        -X POST "${DEPLOY_URL}?token=${DEPLOY_TOKEN}")

                    echo "  HTTP: ${HTTP}  |  Body: $(cat /tmp/resp.txt)"

                    if [ "${HTTP}" = "200" ]; then
                        echo "✅ blade-backend recargado con PM2 (zero-downtime)"
                    else
                        echo "❌ Deploy webhook falló (HTTP ${HTTP})"
                        exit 1
                    fi
                '''
            }
        }

        // ── 5. Health check ─────────────────────────────────────────────────
        stage('Verificar salud') {
            steps {
                sh '''
                    sleep 3
                    HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
                        http://host.docker.internal:${PORT}/health)
                    if [ "${HTTP}" = "200" ]; then
                        echo "✅ Health check OK — API en http://localhost:${PORT}"
                    else
                        echo "⚠️  Health check devolvió HTTP ${HTTP}"
                        exit 1
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline exitoso — BLADE backend disponible en http://localhost:${PORT}"
        }
        failure {
            echo '❌ Pipeline falló — revisa los logs de arriba'
        }
        always {
            echo '📋 Pipeline finalizado'
        }
    }
}
