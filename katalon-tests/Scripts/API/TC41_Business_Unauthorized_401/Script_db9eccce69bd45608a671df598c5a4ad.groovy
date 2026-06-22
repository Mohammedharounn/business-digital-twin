import com.kms.katalon.core.testobject.RequestObject
import com.kms.katalon.core.webservice.keyword.WSBuiltInKeywords as WS
import internal.GlobalVariable as GlobalVariable
RequestObject req = new RequestObject('noauth')
req.setRestUrl(GlobalVariable.API_URL + '/business')
req.setRestRequestMethod('GET')
def res = WS.sendRequest(req)
assert res.getStatusCode() == 401 : 'Expected 401 without token, got ' + res.getStatusCode()
println 'Unauthorized request correctly rejected with 401'
