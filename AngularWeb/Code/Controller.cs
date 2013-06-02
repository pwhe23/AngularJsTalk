
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace AngularWeb
{
	//NUGET: Microsoft.AspNet.WebApi
	public class OrdersController : ApiController
	{
		//Get new *repository* for each request
		private readonly OrderDb _db = new OrderDb();

		// GET /api/orders
		[Queryable]
		public IQueryable<Order> Get()
		{
			return _db.Orders;
		}

		// GET /api/orders/id
		public Order Get(int id)
		{
			return _db.Orders.Find(id);
		}

		// POST /api/orders
		public HttpResponseMessage Post([FromBody] Order order)
		{
			_db.Orders.Add(order);
			_db.SaveChanges();
			return Request.CreateResponse(HttpStatusCode.Created, order);
		}

		// PUT /api/orders/id
		public HttpResponseMessage Put(int id, [FromBody] Order model)
		{
			var order = _db.Orders.Find(id);
			model.CopyTo(order); //copy json object to database tracked object
			model.Items.CopyToList(order.Items);
			_db.SaveChanges();
			return Request.CreateResponse(HttpStatusCode.NoContent);
		}

		// DELETE /api/orders/id
		public HttpResponseMessage Delete(int id)
		{
			var order = _db.Orders.Find(id);
			_db.Orders.Remove(order);
			_db.SaveChanges();
			return Request.CreateResponse(HttpStatusCode.NoContent);
		}

	};
}
