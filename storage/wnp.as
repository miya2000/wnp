package {
	import flash.display.Sprite;
	import flash.system.Security;
	import flash.external.ExternalInterface;
	import flash.net.SharedObject;
	public class wnp extends Sprite
	{
		public function wnp()
		{
			Security.allowDomain("www.nicovideo.jp");
			var host:String = ExternalInterface.call("function(){return location.host}");
			if (host == "www.nicovideo.jp") {
				ExternalInterface.addCallback("getData", getData);
				ExternalInterface.addCallback("setData", setData);
			}
		}
		private function setData(key:String, data:Object, name:String = null):String {
			var localName:String = "wnp" + (name ? ("_" + name) : "");
			var so:SharedObject = SharedObject.getLocal(localName);
			so.data[key] = data;
			return so.flush();
		}
		private function getData(key:String, name:String = null):Object {
			var localName:String = "wnp" + (name ? ("_" + name) : "");
			var so:SharedObject = SharedObject.getLocal(localName);
			return so.data[key];
		}
	}
}
