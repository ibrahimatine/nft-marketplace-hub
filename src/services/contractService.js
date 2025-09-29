import contractAddressData from '../contracts/contract-address.json';
import { clearLocalStorage } from '../utils/storage';

/**
 * Service pour gérer la détection de redéploiement de contrat
 * et le nettoyage automatique des données obsolètes
 */

const CONTRACT_ADDRESS_KEY = 'lastKnownContractAddress';
const CONTRACT_DEPLOYMENT_KEY = 'lastKnownDeployment';

/**
 * Vérifie si le contrat a été redéployé depuis la dernière visite
 * @returns {boolean} true si le contrat a été redéployé
 */
export const checkContractRedeployment = () => {
  try {
    const currentAddress = contractAddressData.NFTMarketplace;
    const currentDeploymentDate = contractAddressData.deployedAt;

    const lastKnownAddress = localStorage.getItem(CONTRACT_ADDRESS_KEY);
    const lastKnownDeployment = localStorage.getItem(CONTRACT_DEPLOYMENT_KEY);

    console.log('🔍 Vérification du contrat:');
    console.log('Adresse actuelle:', currentAddress);
    console.log('Dernière adresse connue:', lastKnownAddress);
    console.log('Déploiement actuel:', currentDeploymentDate);
    console.log('Dernier déploiement connu:', lastKnownDeployment);

    // Premier lancement ou pas d'historique
    if (!lastKnownAddress || !lastKnownDeployment) {
      console.log('ℹ️ Premier lancement ou pas d\'historique');
      updateContractInfo(currentAddress, currentDeploymentDate);
      return false;
    }

    // Vérifier si l'adresse a changé OU si la date de déploiement a changé
    const addressChanged = lastKnownAddress !== currentAddress;
    const deploymentChanged = lastKnownDeployment !== currentDeploymentDate;

    if (addressChanged || deploymentChanged) {
      console.log('🚨 Redéploiement de contrat détecté!');
      console.log('Changement d\'adresse:', addressChanged);
      console.log('Changement de déploiement:', deploymentChanged);

      // Nettoyer les données obsolètes
      cleanupObsoleteData();

      // Mettre à jour les informations du contrat
      updateContractInfo(currentAddress, currentDeploymentDate);

      return true;
    }

    console.log('✅ Même contrat, pas de nettoyage nécessaire');
    return false;

  } catch (error) {
    console.error('Erreur lors de la vérification du contrat:', error);
    return false;
  }
};

/**
 * Nettoie les données obsolètes après un redéploiement
 */
const cleanupObsoleteData = () => {
  console.log('🧹 Nettoyage des données obsolètes...');

  try {
    // Nettoyer le localStorage des NFTs soumis
    clearLocalStorage();
    console.log('✅ localStorage nettoyé');

    // Notifier l'utilisateur si nécessaire
    const shouldNotify = localStorage.getItem('notifyContractChange') !== 'false';
    if (shouldNotify && window.confirm) {
      const userConsent = window.confirm(
        '🔄 Un nouveau contrat a été déployé!\n\n' +
        'Vos NFTs locaux non publiés ont été supprimés pour éviter les conflits.\n' +
        'Les NFTs déjà sur la blockchain restent intacts.\n\n' +
        'Continuer?'
      );

      if (!userConsent) {
        // L'utilisateur peut choisir de ne plus être notifié
        if (window.confirm('Souhaitez-vous désactiver ces notifications futures?')) {
          localStorage.setItem('notifyContractChange', 'false');
        }
      }
    }

    console.log('✅ Nettoyage terminé');

  } catch (error) {
    console.error('Erreur lors du nettoyage:', error);
  }
};

/**
 * Met à jour les informations du contrat stockées localement
 */
const updateContractInfo = (address, deploymentDate) => {
  try {
    localStorage.setItem(CONTRACT_ADDRESS_KEY, address);
    localStorage.setItem(CONTRACT_DEPLOYMENT_KEY, deploymentDate || new Date().toISOString());
    console.log('📝 Informations du contrat mises à jour');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des informations du contrat:', error);
  }
};

/**
 * Obtient l'adresse actuelle du contrat
 */
export const getCurrentContractAddress = () => {
  return contractAddressData.NFTMarketplace;
};

/**
 * Obtient la date de déploiement actuelle du contrat
 */
export const getCurrentDeploymentDate = () => {
  return contractAddressData.deployedAt;
};

/**
 * Obtient l'adresse précédente du contrat
 */
export const getPreviousContractAddress = () => {
  return contractAddressData.previousAddress;
};

/**
 * Réinitialise les notifications de changement de contrat
 */
export const resetContractChangeNotifications = () => {
  localStorage.removeItem('notifyContractChange');
  console.log('🔔 Notifications de changement de contrat réactivées');
};

/**
 * Initialise le service de vérification de contrat
 * À appeler au démarrage de l'application
 */
export const initializeContractService = () => {
  console.log('🚀 Initialisation du service de contrat...');

  const wasRedeployed = checkContractRedeployment();

  if (wasRedeployed) {
    console.log('⚠️ Contrat redéployé détecté lors de l\'initialisation');

    // Optionnel: recharger la page après nettoyage pour éviter les états incohérents
    setTimeout(() => {
      if (window.location.pathname !== '/') {
        console.log('🔄 Redirection vers l\'accueil après redéploiement');
        window.location.href = '/';
      }
    }, 2000);
  }

  return {
    wasRedeployed,
    currentAddress: getCurrentContractAddress(),
    deploymentDate: getCurrentDeploymentDate(),
    previousAddress: getPreviousContractAddress()
  };
};

export default {
  checkContractRedeployment,
  getCurrentContractAddress,
  getCurrentDeploymentDate,
  getPreviousContractAddress,
  resetContractChangeNotifications,
  initializeContractService
};