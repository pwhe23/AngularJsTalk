
using System;
using System.Web;
using System.Web.Http;

namespace AngularWeb
{
	public class Global : HttpApplication
	{
		protected void Application_Start(object sender, EventArgs e)
		{
			GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.ReferenceLoopHandling =
				Newtonsoft.Json.ReferenceLoopHandling.Ignore;

			GlobalConfiguration.Configuration.Formatters.JsonFormatter.SerializerSettings.DateTimeZoneHandling =
				Newtonsoft.Json.DateTimeZoneHandling.Utc;

			GlobalConfiguration.Configuration.Routes.MapHttpRoute(
					name: "DefaultApi",
					routeTemplate: "api/{controller}/{id}",
					defaults: new { id = RouteParameter.Optional }
				);
		}

		protected void Session_Start(object sender, EventArgs e) {}
		protected void Application_BeginRequest(object sender, EventArgs e) {}
		protected void Application_AuthenticateRequest(object sender, EventArgs e) {}
		protected void Application_Error(object sender, EventArgs e) {}
		protected void Session_End(object sender, EventArgs e) { }
		protected void Application_End(object sender, EventArgs e) {}

	};
}