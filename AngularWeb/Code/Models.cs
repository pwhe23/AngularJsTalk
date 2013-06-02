
using System;
using System.Collections.Generic;

namespace AngularWeb
{
	public class Order
	{
		public Order()
		{
			Date = DateTime.Now;
			Items = new List<OrderItem>();
		}
		public int OrderId { get; set; } //Key matches class name
		public string Name { get; set; }
		public bool Paid { get; set; }
		public DateTime Date { get; set; }
		public virtual List<OrderItem> Items { get; set; } //Virtual to enable tracking
	};

	public class OrderItem : IEquatable<OrderItem>
	{
		public int OrderItemId { get; set; }
		public string Description { get; set; }
		public decimal Amount { get; set; }
		bool IEquatable<OrderItem>.Equals(OrderItem other)
		{
			return other != null && OrderItemId > 0 && OrderItemId == other.OrderItemId; //to sync lists
		}
	};
}
