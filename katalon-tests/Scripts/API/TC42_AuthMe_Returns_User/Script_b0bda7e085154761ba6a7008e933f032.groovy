import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.testobject.TestObjectProperty
import com.kms.katalon.core.testobject.ConditionType
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
import groovy.json.JsonSlurper
String token = CustomKeywords.'com.bdt.ApiKeywords.getAuthToken'(GlobalVariable.TEST_EMAIL, GlobalVariable.TEST_PASSWORD)
RequestObject req = new RequestObject('me')
req.setRestUrl(GlobalVariable.API_URL + '/auth/me')
req.setRestRequestMethod('GET')
req.setHttpHeaderProperties([new TestObjectProperty('Authorization', ConditionType.EQUALS, 'Bearer ' + token)])
def res = WS.sendRequest(req)
assert res.getStatusCode() == 200
def j = new JsonSlurper().parseText(res.getResponseText())
assert j.data.email == GlobalVariable.TEST_EMAIL : 'Wrong user: ' + j.data.email
println 'auth/me returned: ' + j.data.email
