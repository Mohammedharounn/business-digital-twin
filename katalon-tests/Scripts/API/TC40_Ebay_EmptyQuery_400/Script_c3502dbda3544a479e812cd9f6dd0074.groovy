import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
RequestObject req = new RequestObject('empty')
req.setRestUrl(GlobalVariable.API_URL + '/marketplace/search?q=')
req.setRestRequestMethod('GET')
def hs = [new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token)]
req.setHttpHeaderProperties(hs)
def res = WS.sendRequest(req)
assert res.getStatusCode() == 400 : 'Expected 400 for empty query, got ' + res.getStatusCode()
println 'Empty query correctly rejected with 400'
