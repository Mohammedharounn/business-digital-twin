import com.kms.katalon.core.webui.keyword.WebUiBuiltInKeywords as WebUI
import static com.kms.katalon.core.testobject.ObjectRepository.findTestObject
import internal.GlobalVariable as GlobalVariable

WebUI.openBrowser('')
WebUI.maximizeWindow()
CustomKeywords.'com.bdt.AuthKeywords.loginVerified'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
CustomKeywords.'com.bdt.AuthKeywords.enterAnyProject'()
WebUI.click(findTestObject('Navigation/nav_Overview'))
WebUI.click(findTestObject('Dashboard/tab_CashFlow'));      WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_NeuralRisks'));   WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_UnitEconomics')); WebUI.delay(1)
WebUI.click(findTestObject('Dashboard/tab_Overview'));      WebUI.delay(1)
WebUI.verifyElementVisible(findTestObject('Dashboard/kpi_MonthlyRevenue'))
WebUI.closeBrowser()
