
using System.Data.Entity;

namespace AngularWeb
{
	//NUGET: EntityFramework
	//Database stored in /App_Data/
	public class OrderDb : DbContext
	{
		public OrderDb()
		{
			//Don't use in production :)
			Database.SetInitializer(new DropCreateDatabaseIfModelChanges<OrderDb>());
		}

		protected override void OnModelCreating(DbModelBuilder modelBuilder)
		{
			//Enable cascade-delete
			modelBuilder.Entity<Order>()
						.HasMany(x => x.Items)
						.WithOptional()
						.WillCascadeOnDelete(true);
		}

		//Tell context which entities to track
		public DbSet<Order> Orders { get; set; }
		public DbSet<OrderItem> OrderItems { get; set; }
	};

}
