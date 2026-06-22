import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

// Add equipment via Marketplace, log out, log back in, verify it persisted via API.
WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Marketplace'))
WebUI.setText(findTestObject('Marketplace/input_Search'), 'Office Chair')
WebUI.click(findTestObject('Marketplace/btn_Search'))
WebUI.waitForElementVisible(findTestObject('Marketplace/btn_AddToBusiness_First'), GlobalVariable.DEFAULT_TIMEOUT as int)
WebUI.click(findTestObject('Marketplace/btn_AddToBusiness_First'))
WebUI.delay(3)   // allow debounced cloud save
CustomKeywords.'com.bdt.AuthKeywords.logout'()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)

// Verify at the data layer that purchasedEquipment persisted
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
def json = CustomKeywords.'com.bdt.ApiKeywords.getProjects'(token)
def hasEquipment = json.data.any { (it.config?.purchasedEquipment ?: []).size() > 0 }
assert hasEquipment : 'purchasedEquipment did not persist after re-login'
WebUI.closeBrowser()
